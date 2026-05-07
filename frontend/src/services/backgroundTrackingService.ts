/**
 * BackgroundTrackingService
 * 
 * Manages:
 * 1. Service Worker registration & communication
 * 2. IndexedDB persistence of GPS points when socket is offline
 * 3. Automatic flush of buffered points when connection is restored
 * 4. Background Sync registration for offline-to-online recovery
 */

const DB_NAME = 'SpeedoTrackingDB';
const DB_VERSION = 1;
const STORE_NAME = 'pendingLocations';

// ── IndexedDB ─────────────────────────────────────────
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
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

export async function bufferGPSPoint(tripId: string, point: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.add({ tripId, point, timestamp: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingPoints(tripId: string): Promise<Array<{ id: number; point: any }>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const idx = store.index('tripId');
    const req = idx.getAll(tripId);
    req.onsuccess = () => resolve(req.result as any[]);
    req.onerror = () => reject(req.error);
  });
}

export async function clearPendingPoints(tripId: string): Promise<void> {
  const pending = await getPendingPoints(tripId);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const row of pending) {
      store.delete(row.id);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function countPendingPoints(tripId: string): Promise<number> {
  const rows = await getPendingPoints(tripId);
  return rows.length;
}

// ── Service Worker Registration ───────────────────────
let _swRegistration: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[BGTracking] Service Workers not supported');
    return false;
  }
  try {
    _swRegistration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('[BGTracking] ✅ Service Worker registered:', _swRegistration.scope);
    return true;
  } catch (err) {
    console.error('[BGTracking] SW registration failed:', err);
    return false;
  }
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (_swRegistration) return _swRegistration;
  if ('serviceWorker' in navigator) {
    _swRegistration = (await navigator.serviceWorker.getRegistration('/')) || null;
  }
  return _swRegistration;
}

// ── Send config to Service Worker ────────────────────
export function notifyServiceWorker(message: object): void {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

export function configureServiceWorker(serverUrl: string, accessToken: string): void {
  notifyServiceWorker({
    type: 'SET_CONFIG',
    payload: { serverUrl, accessToken },
  });
}

export function notifyTrackingStarted(tripId: string): void {
  notifyServiceWorker({ type: 'TRACKING_STARTED', payload: { tripId } });
}

export function notifyTrackingStopped(): void {
  notifyServiceWorker({ type: 'TRACKING_STOPPED' });
}

// ── Background Sync Registration ──────────────────────
export async function registerBackgroundSync(): Promise<boolean> {
  try {
    const reg = await getServiceWorkerRegistration();
    if (!reg) return false;

    // @ts-ignore – Background Sync API types are not always included
    if (reg.sync) {
      // @ts-ignore
      await reg.sync.register('location-sync');
      console.log('[BGTracking] Background Sync registered');
      return true;
    }
  } catch (err) {
    console.warn('[BGTracking] Background Sync not supported:', err);
  }
  return false;
}

// ── Batch HTTP Flush (when SW sync or on visibility restore) ──
export async function flushBufferedPoints(
  tripId: string,
  serverUrl: string,
  accessToken: string
): Promise<number> {
  const pending = await getPendingPoints(tripId);
  if (pending.length === 0) return 0;

  const points = pending.map((r) => r.point);
  console.log(`[BGTracking] Flushing ${points.length} buffered points for trip ${tripId}`);

  try {
    const res = await fetch(`${serverUrl}/trip/${tripId}/batch-locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ points }),
    });

    if (res.ok) {
      await clearPendingPoints(tripId);
      console.log(`[BGTracking] ✅ Flushed ${points.length} points`);
      return points.length;
    } else {
      console.warn('[BGTracking] Batch flush failed with status:', res.status);
      return 0;
    }
  } catch (err) {
    console.error('[BGTracking] Network error during flush:', err);
    // Register background sync so SW retries when online
    await registerBackgroundSync();
    return 0;
  }
}

// ── PWA Install Prompt ────────────────────────────────
let _installPrompt: any = null;

export function captureInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    _installPrompt = e;
    console.log('[BGTracking] 📲 PWA install prompt captured');
  });
}

export async function triggerInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!_installPrompt) return 'unavailable';
  _installPrompt.prompt();
  const { outcome } = await _installPrompt.userChoice;
  _installPrompt = null;
  return outcome;
}

export function isInstallPromptAvailable(): boolean {
  return _installPrompt !== null;
}

export function isRunningAsPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
