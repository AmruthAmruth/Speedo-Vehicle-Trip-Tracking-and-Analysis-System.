/* ====================================================
   Speedo Vehicle Tracking – Service Worker
   Handles: Background Sync, Offline Cache, Keep-alive
   ==================================================== */

const CACHE_NAME = 'speedo-cache-v1';
const DB_NAME = 'SpeedoTrackingDB';
const DB_VERSION = 1;
const STORE_NAME = 'pendingLocations';

// ── Cache static shell on install ────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  event.waitUntil(clients.claim());
});

// ── IndexedDB helpers ─────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('tripId', 'tripId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getPendingPoints(tripId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const idx = store.index('tripId');
    const req = idx.getAll(tripId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deletePendingPoints(ids) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    let count = 0;
    for (const id of ids) {
      store.delete(id);
      count++;
    }
    tx.oncomplete = () => resolve(count);
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllPendingTrips() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const rows = req.result;
      // Group by tripId
      const trips = {};
      for (const row of rows) {
        if (!trips[row.tripId]) trips[row.tripId] = [];
        trips[row.tripId].push(row);
      }
      resolve(trips);
    };
    req.onerror = () => reject(req.error);
  });
}

// ── Background Sync ───────────────────────────────────
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  if (event.tag === 'location-sync') {
    event.waitUntil(syncPendingLocations());
  }
});

async function syncPendingLocations() {
  console.log('[SW] Syncing pending locations...');
  try {
    const tripGroups = await getAllPendingTrips();
    const tripIds = Object.keys(tripGroups);

    if (tripIds.length === 0) {
      console.log('[SW] No pending locations to sync');
      return;
    }

    for (const tripId of tripIds) {
      const rows = tripGroups[tripId];
      const points = rows.map((r) => r.point);
      const ids = rows.map((r) => r.id);
      const accessToken = await getStoredToken();

      console.log(`[SW] Sending ${points.length} buffered points for trip ${tripId}`);

      try {
        const res = await fetch(
          `${self.serverUrl || ''}/api/trips/${tripId}/batch-locations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ points }),
          }
        );

        if (res.ok) {
          await deletePendingPoints(ids);
          console.log(`[SW] ✅ Synced ${points.length} points for trip ${tripId}`);
          // Notify open clients
          notifyClients({ type: 'SYNC_COMPLETE', tripId, count: points.length });
        } else {
          console.warn('[SW] Batch upload failed, will retry:', res.status);
        }
      } catch (fetchErr) {
        console.error('[SW] Fetch failed during sync:', fetchErr);
        throw fetchErr; // re-throw so background sync retries
      }
    }
  } catch (err) {
    console.error('[SW] syncPendingLocations error:', err);
    throw err;
  }
}

// ── Token helper (reads from IDB cache set by main thread) ──
let _cachedToken = null;
async function getStoredToken() {
  return _cachedToken || '';
}

// ── Message handler (from main thread) ───────────────
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SET_CONFIG':
      // Main thread sends server URL and auth token
      self.serverUrl = payload.serverUrl;
      _cachedToken = payload.accessToken;
      console.log('[SW] Config received, serverUrl:', self.serverUrl);
      break;

    case 'TRACKING_STARTED':
      self.activeTripId = payload.tripId;
      console.log('[SW] Tracking started for trip:', payload.tripId);
      break;

    case 'TRACKING_STOPPED':
      self.activeTripId = null;
      console.log('[SW] Tracking stopped');
      break;

    case 'TRIGGER_SYNC':
      // Main thread requesting manual sync flush
      console.log('[SW] Manual sync requested');
      await syncPendingLocations();
      break;

    default:
      break;
  }
});

// ── Fetch handler (network-first for API, cache for assets) ──
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Don't intercept API requests – let them go through normally
  if (url.pathname.startsWith('/api')) return;

  // For navigation requests, serve the cached index.html (SPA fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }
});

// ── Notify all open clients ───────────────────────────
async function notifyClients(message) {
  const allClients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of allClients) {
    client.postMessage(message);
  }
}

console.log('[SW] Service Worker script loaded');
