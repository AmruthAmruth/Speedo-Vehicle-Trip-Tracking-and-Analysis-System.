import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    IconButton,
    Fade,
    CircularProgress,
    BottomNavigation,
    BottomNavigationAction,
    Divider
} from '@mui/material';
import { 
    MyLocation as GpsFixedIcon, 
    DirectionsCar as CarIcon,
    PowerSettingsNew as PowerIcon,
    Dashboard as DashboardIcon,
    History as HistoryIcon,
    QrCodeScanner as ScanIcon,
    Lock as LockIcon,
    ArrowForwardIos as ArrowForwardIcon
} from '@mui/icons-material';
import { socketService } from '../../../services/socketService';
import { tripApi } from '../../../services/tripApi';
import { authApi } from '../../../services/authApi';
import { formatSpeed, formatDuration } from '../../../utils/tripUtils';
import { toast } from 'react-toastify';
import { Trip } from '../../../types/trip.types';
import {
    bufferGPSPoint,
    configureServiceWorker,
    notifyTrackingStarted,
    notifyTrackingStopped,
    flushBufferedPoints,
    countPendingPoints,
    captureInstallPrompt,
    triggerInstallPrompt,
    isInstallPromptAvailable,
    isRunningAsPWA,
    isIOS,
    registerServiceWorker,
} from '../../../services/backgroundTrackingService';
import { Button, Card, Input, Badge } from '../../../components/shared/ui';

const SERVER_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000';

const MobileTracker: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token: pathToken } = useParams<{ token: string }>();
    const queryParams = new URLSearchParams(location.search);
    const pairingToken = pathToken || queryParams.get('token');
    
    // UI State
    const [view, setView] = useState<'track' | 'overview'>('track');
    const [appState, setAppState] = useState<'initializing' | 'pairing' | 'ready' | 'error'>('initializing');
    
    // Device identity (Persistent)
    const [deviceName, setDeviceName] = useState<string>(localStorage.getItem('speedo_device_name') || '');
    const [deviceId] = useState<string>(() => {
        const saved = localStorage.getItem('speedo_device_id');
        if (saved) return saved;
        const newId = (typeof crypto.randomUUID === 'function') 
            ? crypto.randomUUID() 
            : Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('speedo_device_id', newId);
        return newId;
    });
    
    // Tracking State
    const [tripName, setTripName] = useState<string>('');
    const [activeTripId, setActiveTripId] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState<'idle' | 'tracking' | 'error' | 'finished'>('idle');
    const [loading, setLoading] = useState(true);
    const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
    
    const [currentPoint, setCurrentPoint] = useState<{
        latitude: number;
        longitude: number;
        speed: number;
        timestamp: string;
    } | null>(null);
    const [duration, setDuration] = useState(0);

    const watchIdRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const wakeLockRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Background tracking state
    const [bufferedCount, setBufferedCount] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showInstallBanner, setShowInstallBanner] = useState(false);

    // Wake Lock Support
    const requestWakeLock = async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
                console.log('✅ Wake Lock is active');
            } catch (err: any) {
                console.error(`Wake Lock Error: ${err.name}, ${err.message}`);
            }
        }
    };

    const releaseWakeLock = async () => {
        if (wakeLockRef.current) {
            await wakeLockRef.current.release();
            wakeLockRef.current = null;
        }
    };

    const playSilentAudio = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
            audioRef.current.loop = true;
        }
        audioRef.current.play().catch(err => console.warn('Audio play failed:', err));
    };

    const stopSilentAudio = () => {
        if (audioRef.current) audioRef.current.pause();
    };

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && isTracking && activeTripId) {
                await requestWakeLock();
                const token = localStorage.getItem('accessToken') || '';
                const flushed = await flushBufferedPoints(activeTripId, SERVER_URL, token);
                if (flushed > 0) {
                    toast.success(`📡 Synced ${flushed} buffered GPS points`);
                    setBufferedCount(0);
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isTracking, activeTripId]);

    useEffect(() => {
        captureInstallPrompt();
        const onOnline = async () => {
            setIsOnline(true);
            if (isTracking && activeTripId) {
                const token = localStorage.getItem('accessToken') || '';
                const n = await flushBufferedPoints(activeTripId, SERVER_URL, token);
                if (n > 0) { toast.success(`📡 Back online — synced ${n} points`); setBufferedCount(0); }
            }
        };
        const onOffline = () => { setIsOnline(false); toast.warn('📶 Offline — GPS points are being buffered locally'); };
        const onSWMessage = (e: MessageEvent) => {
            if (e.data?.type === 'SYNC_COMPLETE') {
                toast.success(`📡 Background sync: ${e.data.count} points delivered`);
                setBufferedCount(0);
            }
        };
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        navigator.serviceWorker?.addEventListener('message', onSWMessage);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
            navigator.serviceWorker?.removeEventListener('message', onSWMessage);
        };
    }, [isTracking, activeTripId]);

    useEffect(() => {
        const bootstrap = async () => {
            await registerServiceWorker();
            const secret = localStorage.getItem('speedo_device_secret');
            
            if (secret) {
                try {
                    const response = await authApi.validateDeviceSecret({ deviceId, deviceSecret: secret });
                    localStorage.setItem('accessToken', response.accessToken);
                    localStorage.setItem('refreshToken', response.refreshToken);
                    localStorage.setItem('user', JSON.stringify(response.user));
                    setAppState('ready');
                    loadRecentTrips();
                } catch (err) {
                    localStorage.removeItem('speedo_device_secret');
                    setAppState(pairingToken ? 'pairing' : 'error');
                }
            } else if (pairingToken) {
                setAppState('pairing');
            } else {
                setAppState('error');
            }
            setLoading(false);
        };

        bootstrap();
        localStorage.setItem('speedo_device_id', deviceId);
    }, [pairingToken, deviceId]);

    const loadRecentTrips = async () => {
        try {
            const response = await tripApi.getUserTrips();
            setRecentTrips(response.trips.slice(0, 10));
        } catch (err) {
            console.error("Failed to load history:", err);
        }
    };

    useEffect(() => {
        socketService.connect();
        return () => {
            if (isTracking) {
                stopTracking();
            }
        };
    }, []);

    const handlePairing = async () => {
        if (!deviceName.trim()) {
            toast.warn('Please provide a name for this vehicle');
            return;
        }

        if (!pairingToken) return;

        setLoading(true);
        try {
            const response = await authApi.linkDevice({
                pairingToken,
                deviceId,
                deviceName
            });

            localStorage.setItem('speedo_device_secret', response.deviceSecret);
            localStorage.setItem('speedo_device_name', deviceName);
            
            const auth = await authApi.validateDeviceSecret({ deviceId, deviceSecret: response.deviceSecret });
            localStorage.setItem('accessToken', auth.accessToken);
            localStorage.setItem('refreshToken', auth.refreshToken);
            localStorage.setItem('user', JSON.stringify(auth.user));

            setAppState('ready');
            toast.success(`Vehicle Linked: ${deviceName}`);
        } catch (err) {
            toast.error("Pairing failed. Link expired.");
            setAppState('error');
        } finally {
            setLoading(false);
        }
    };

    const startTracking = async () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported");
            return;
        }

        setLoading(true);
        try {
            const response = await tripApi.startLiveTrip(
                tripName || undefined, 
                { source: 'mobile', deviceName }
            );
            setActiveTripId(response.trip._id);
            socketService.joinTrip(response.trip._id);

            const token = localStorage.getItem('accessToken') || '';
            configureServiceWorker(SERVER_URL, token);
            notifyTrackingStarted(response.trip._id);

            if (!isRunningAsPWA() && isInstallPromptAvailable()) setShowInstallBanner(true);
            
            setIsTracking(true);
            setStatus('tracking');
            await requestWakeLock();
            playSilentAudio();
            
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, speed, heading } = position.coords;
                    const point = {
                        latitude,
                        longitude,
                        speed: (speed || 0) * 3.6,
                        heading: heading || 0,
                        timestamp: new Date(position.timestamp).toISOString(),
                        ignition: true 
                    };
                    setCurrentPoint({ latitude, longitude, speed: point.speed, timestamp: point.timestamp });
                    socketService.emitLocationUpdate(response.trip._id, point);
                    if (!navigator.onLine) {
                        bufferGPSPoint(response.trip._id, point).then(() =>
                            countPendingPoints(response.trip._id).then(setBufferedCount)
                        );
                    }
                },
                (err) => console.error(`Location Error: ${err.message}`),
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
            );
        } catch (err) {
            toast.error("Failed to start session.");
        } finally {
            setLoading(false);
        }
    };

    const stopTracking = async () => {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        notifyTrackingStopped();
        setShowInstallBanner(false);
        await releaseWakeLock();
        stopSilentAudio();
        
        setIsTracking(false);
        if (activeTripId) {
            try {
                await tripApi.stopLiveTrip(activeTripId);
                toast.success('Trip completed');
                setStatus('finished');
                loadRecentTrips();
            } catch (err) {
                setStatus('idle');
            }
        }
    };

    if (loading && appState === 'initializing') {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-brand-500" />
                <p className="text-slate-400 font-medium animate-pulse">Connecting to Fleet...</p>
            </div>
        );
    }

    if (appState === 'error') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <Card className="w-full max-w-sm p-10 text-center animate-fade-in shadow-xl">
                    <div className="mx-auto w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
                        <ScanIcon sx={{ fontSize: 40, color: '#64748b' }} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Link Required</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        This device is not linked to any fleet. Please scan the QR code from your manager's dashboard.
                    </p>
                    <Button variant="primary" className="w-full py-6 rounded-2xl" onClick={() => window.location.reload()}>
                        Retry Connection
                    </Button>
                </Card>
            </div>
        );
    }

    if (appState === 'pairing') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <Card className="w-full max-w-sm p-10 text-center animate-fade-in shadow-xl">
                    <div className="mx-auto w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mb-6">
                        <LockIcon sx={{ fontSize: 40, color: '#435cf0' }} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Pairing Device</h2>
                    <p className="text-slate-500 mb-8">Securely linking this vehicle to your fleet.</p>
                    
                    <div className="space-y-6 text-left">
                        <Input 
                            label="Vehicle/Device Name" 
                            placeholder="e.g. Truck-42" 
                            value={deviceName} 
                            onChange={(e) => setDeviceName(e.target.value)}
                        />
                        <Button 
                            variant="primary" 
                            className="w-full py-6 rounded-2xl" 
                            onClick={handlePairing}
                            isLoading={loading}
                        >
                            Link & Start Tracking
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const renderOverview = () => (
        <div className="space-y-8 animate-fade-in pb-24">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fleet Dashboard</h2>
                <p className="text-slate-500">Monitor your assigned device and history.</p>
            </div>

            <Card className="p-5 border-l-4 border-brand-500">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-brand-50 rounded-xl">
                        <CarIcon className="text-brand-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">{deviceName}</h3>
                        <p className="text-xs text-slate-400 font-mono tracking-tighter uppercase">ID: {deviceId.slice(0,12)}</p>
                    </div>
                    <Badge variant="success" size="sm" className="ml-auto">Verified</Badge>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Network Status</span>
                    <span className="text-xs font-bold text-success-dark">Operational</span>
                </div>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Recent Trips</h3>
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                    {recentTrips.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 font-medium">No history found.</div>
                    ) : (
                        recentTrips.map((trip, idx) => (
                            <div 
                                key={trip._id} 
                                className={`flex items-center justify-between p-5 active:bg-slate-50 transition-colors ${idx !== recentTrips.length - 1 ? 'border-b border-slate-50' : ''}`}
                                onClick={() => navigate(`/dashboard/trips/${trip._id}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                        <HistoryIcon fontSize="small" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 line-clamp-1">{trip.name || `Trip ${idx+1}`}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            {(trip.totalDistance || 0).toFixed(1)} km • {new Date(trip.startTime).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <ArrowForwardIcon sx={{ fontSize: 14, color: '#cbd5e1' }} />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    const renderTrack = () => (
        <div className="flex-grow flex flex-col space-y-6 animate-fade-in pb-24">
            <Card className="flex-grow flex flex-col items-center justify-center p-8 text-center relative overflow-hidden border-slate-100 shadow-xl">
                {status === 'tracking' ? (
                    <div className="w-full space-y-10">
                        <div className="relative inline-flex mb-8">
                           <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
                           <div className="w-24 h-24 bg-success text-white rounded-full flex items-center justify-center relative z-10 shadow-lg shadow-success/30">
                               <GpsFixedIcon sx={{ fontSize: 48 }} />
                           </div>
                        </div>

                        <div>
                            <Badge variant="success" pulse size="md" className="mb-2">EN ROUTE</Badge>
                            <div className="flex items-center justify-center gap-2 text-slate-500 font-medium text-sm">
                                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success' : 'bg-warning'}`} />
                                {isOnline ? 'Network: Strong' : `Offline (${bufferedCount} points)`}
                            </div>
                        </div>

                        {isIOS() && (
                            <div className="bg-warning-light border border-warning/20 p-3 rounded-2xl text-xs text-warning-dark font-bold">
                                ⚠️ iOS: Keep screen on for background tracking
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full space-y-6">
                        <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto mb-4">
                            <CarIcon sx={{ fontSize: 48, color: '#94a3b8' }} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Vehicle Ready</h2>
                            <p className="text-slate-500">Initiate your tracking session below.</p>
                        </div>
                        <Input 
                            placeholder="Job ID / Route Name (Optional)" 
                            value={tripName} 
                            onChange={(e) => setTripName(e.target.value)}
                            className="bg-slate-50 border-transparent text-center h-14 text-lg font-semibold"
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 w-full mt-10">
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Current Speed</span>
                        <span className="text-2xl font-display font-black text-slate-900">{currentPoint ? formatSpeed(currentPoint.speed) : '0.0'}</span>
                        <span className="text-[10px] font-bold text-slate-400 ml-1">km/h</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Elapsed Time</span>
                        <span className="text-2xl font-display font-black text-slate-900">{formatDuration(duration)}</span>
                    </div>
                </div>

                <div className="w-full mt-8">
                    {!isTracking ? (
                        <Button 
                            variant="primary" 
                            className="w-full py-8 rounded-[32px] text-xl font-bold shadow-glow" 
                            onClick={startTracking}
                            isLoading={loading}
                        >
                            Start Session
                        </Button>
                    ) : (
                        <Button 
                            variant="danger" 
                            className="w-full py-8 rounded-[32px] text-xl font-bold" 
                            onClick={stopTracking}
                        >
                            End Session
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
            {/* PWA Install Banner */}
            {showInstallBanner && (
                <div className="bg-brand-600 text-white px-6 py-4 flex items-center justify-between gap-4 animate-slide-up relative z-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">📲</div>
                        <p className="text-sm font-bold">Install App for Background Tracking</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            className="bg-white text-brand-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm"
                            onClick={() => triggerInstallPrompt().then(() => setShowInstallBanner(false))}
                        >
                            Install
                        </button>
                        <button className="text-white/70 text-xs font-bold px-2" onClick={() => setShowInstallBanner(false)}>Dismiss</button>
                    </div>
                </div>
            )}

            <div className="flex-grow container max-w-md mx-auto px-6 py-8 flex flex-col">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] leading-none mb-1">Fleet Tracker</span>
                        <h1 className="text-xl font-display font-black text-slate-900 tracking-tight leading-none uppercase">Speedo</h1>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-1.5 pl-4 rounded-full border border-slate-200 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{deviceName}</span>
                        <IconButton 
                            size="small" 
                            onClick={() => { localStorage.removeItem('speedo_device_secret'); setAppState('error'); }}
                            className="bg-slate-100 hover:bg-error/10"
                        >
                            <PowerIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                        </IconButton>
                    </div>
                </header>

                {view === 'track' ? renderTrack() : renderOverview()}
            </div>

            {/* Premium Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 pb-6 pt-2 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                <BottomNavigation 
                    showLabels 
                    value={view} 
                    onChange={(_, newValue) => setView(newValue)} 
                    sx={{ height: 64, bgcolor: 'transparent', '& .Mui-selected': { color: '#435cf0 !important' } }}
                >
                    <BottomNavigationAction value="track" label="Track" icon={<GpsFixedIcon />} />
                    <BottomNavigationAction value="overview" label="Fleet" icon={<DashboardIcon />} />
                </BottomNavigation>
            </div>
        </div>
    );
};

export default MobileTracker;

