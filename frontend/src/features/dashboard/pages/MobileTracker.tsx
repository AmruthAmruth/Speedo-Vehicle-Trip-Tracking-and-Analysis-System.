import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Button, 
    Paper, 
    Container, 
    IconButton,
    TextField,
    Fade,
    CircularProgress,
    BottomNavigation,
    BottomNavigationAction,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import { 
    MyLocation as GpsFixedIcon, 
    DirectionsCar as CarIcon,
    PowerSettingsNew as PowerIcon,
    Dashboard as DashboardIcon,
    History as HistoryIcon,
    QrCodeScanner as ScanIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import { socketService } from '../../../services/socketService';
import { tripApi } from '../../../services/tripApi';
import { authApi } from '../../../services/authApi';
import { formatSpeed, formatDuration } from '../../../utils/tripUtils';
import { toast } from 'react-toastify';
import { Trip } from '../../../types/trip.types';

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

    // Wake Lock Support
    const requestWakeLock = async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
                console.log('✅ Wake Lock is active');
                
                wakeLockRef.current.addEventListener('release', () => {
                    console.log('⚠️ Wake Lock was released');
                });
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

    // Handle background/foreground transitions
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && isTracking) {
                // Re-acquire wake lock if we come back to foreground
                await requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isTracking]);

    // Bootstrap: check persistence or pairing
    useEffect(() => {
        const bootstrap = async () => {
            const secret = localStorage.getItem('speedo_device_secret');
            
            console.log("Tracker Bootstrap:", { secret: !!secret, pairingToken: !!pairingToken });

            // 1. If we have a secret, try to auto-authenticate
            if (secret) {
                try {
                    const response = await authApi.validateDeviceSecret({ deviceId, deviceSecret: secret });
                    localStorage.setItem('accessToken', response.accessToken);
                    localStorage.setItem('refreshToken', response.refreshToken);
                    localStorage.setItem('user', JSON.stringify(response.user));
                    setAppState('ready');
                    loadRecentTrips();
                } catch (err) {
                    console.error("Persistence validation failed:", err);
                    localStorage.removeItem('speedo_device_secret');
                    // If secret fails, check if we just scanned a NEW token
                    setAppState(pairingToken ? 'pairing' : 'error');
                }
            } 
            // 2. If no secret but we have a pairing token, go to pairing
            else if (pairingToken) {
                console.log("Switching to pairing mode with token:", pairingToken);
                setAppState('pairing');
            } 
            // 3. Otherwise, we need a QR scan
            else {
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
                releaseWakeLock();
            }
        };
    }, []);

    const handlePairing = async () => {
        if (!deviceName.trim()) {
            toast.warn('Please provide a name for this vehicle/device');
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
            
            // After linking, validate secret to get session tokens
            const auth = await authApi.validateDeviceSecret({ deviceId, deviceSecret: response.deviceSecret });
            localStorage.setItem('accessToken', auth.accessToken);
            localStorage.setItem('refreshToken', auth.refreshToken);
            localStorage.setItem('user', JSON.stringify(auth.user));

            setAppState('ready');
            toast.success(`Vehicle Linked: ${deviceName}`);
        } catch (err) {
            console.error("Pairing failed:", err);
            toast.error("Pairing token invalid or expired.");
            setAppState('error');
        } finally {
            setLoading(false);
        }
    };

    const startTracking = async () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported");
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
            
            setIsTracking(true);
            setStatus('tracking');
            
            // Acquire wake lock to keep CPU alive
            await requestWakeLock();
            
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
                },
                (err) => console.error(`Location Error: ${err.message}`),
                { 
                    enableHighAccuracy: true, 
                    timeout: 20000, // Longer timeout for background
                    maximumAge: 0 
                }
            );
        } catch (err: any) {
            toast.error("Failed to initialize session.");
            if (err.response?.status === 401) setAppState('error');
        } finally {
            setLoading(false);
        }
    };

    const stopTracking = async () => {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Release wake lock
        await releaseWakeLock();
        
        setIsTracking(false);
        if (activeTripId) {
            try {
                await tripApi.stopLiveTrip(activeTripId);
                toast.success('Trip saved!');
                setStatus('finished');
                loadRecentTrips();
            } catch (err) {
                toast.error('Failed to save trip');
                setStatus('idle');
            }
        }
    };

    if (loading && appState === 'initializing') {
        return (
            <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (appState === 'error') {
        return (
            <Container maxWidth="sm" sx={{ py: 6, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: '#f8fafc' }}>
                <Paper elevation={0} sx={{ p: 5, borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <ScanIcon sx={{ fontSize: 60, color: '#64748b', mb: 3 }} />
                    <Typography variant="h5" fontWeight="800" gutterBottom>Link Required</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        This device is not linked to any fleet. Please scan the QR code from your manager's dashboard.
                    </Typography>
                    <Button variant="outlined" fullWidth onClick={() => window.location.reload()}>Retry Connection</Button>
                </Paper>
            </Container>
        );
    }

    if (appState === 'pairing') {
        return (
            <Container maxWidth="sm" sx={{ py: 6, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: '#f8fafc' }}>
                <Fade in timeout={800}>
                    <Paper elevation={0} sx={{ p: 5, borderRadius: 8, textAlign: 'center', background: 'white', border: '1px solid #e2e8f0' }}>
                        <LockIcon sx={{ fontSize: 60, color: '#6366f1', mb: 3 }} />
                        <Typography variant="h4" fontWeight="800" gutterBottom>Pairing Device</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Securely linking this vehicle to your fleet.</Typography>
                        <TextField fullWidth label="Vehicle/Device Name" placeholder="e.g. Truck-42" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} sx={{ mb: 4 }} />
                        <Button variant="contained" fullWidth size="large" onClick={handlePairing} sx={{ borderRadius: 4, py: 2, fontWeight: 'bold' }}>Link & Start Tracking</Button>
                    </Paper>
                </Fade>
            </Container>
        );
    }

    const renderOverview = () => (
        <Fade in timeout={400}>
            <Box sx={{ pb: 10 }}>
                <Typography variant="h5" fontWeight="800" sx={{ mb: 3, color: '#0f172a' }}>Fleet Dashboard</Typography>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 6, mb: 3, bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <CarIcon color="primary" />
                        <Typography variant="h6" fontWeight="700">{deviceName}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">Hardware ID: <code>{deviceId.slice(0,8)}...</code></Typography>
                    <Typography variant="body2" color="text.secondary">Status: <span style={{ color: '#10b981', fontWeight: 700 }}>Verified</span></Typography>
                </Paper>

                <Typography variant="h6" fontWeight="700" sx={{ mb: 2, color: '#475569' }}>Recent Trips</Typography>
                <Paper elevation={0} sx={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <List sx={{ p: 0 }}>
                        {recentTrips.length === 0 ? <ListItem><ListItemText primary="No history found." /></ListItem> : 
                            recentTrips.map((trip, idx) => (
                                <React.Fragment key={trip._id}>
                                    <ListItem secondaryAction={<IconButton onClick={() => navigate(`/dashboard/trips/${trip._id}`)}><HistoryIcon /></IconButton>}>
                                        <ListItemText primary={trip.name || `Trip ${idx+1}`} secondary={`${(trip.totalDistance || 0).toFixed(1)} km • ${new Date(trip.startTime).toLocaleDateString()}`} primaryTypographyProps={{ fontWeight: 700 }} />
                                    </ListItem>
                                    {idx < recentTrips.length - 1 && <Divider />}
                                </React.Fragment>
                            ))
                        }
                    </List>
                </Paper>
            </Box>
        </Fade>
    );

    const renderTrack = () => (
        <Fade in timeout={400}>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 8, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'white', border: '1px solid #e2e8f0', mb: 4 }}>
                    {status === 'tracking' ? (
                        <Box sx={{ mb: 4 }}>
                            <Box className="tracking-pulse-container"><Box className="tracking-pulse-core"><GpsFixedIcon sx={{ fontSize: 50, color: 'white' }} /></Box></Box>
                            <Typography variant="h6" color="#10b981" fontWeight="800" sx={{ mt: 3 }}>EN ROUTE</Typography>
                            <Box sx={{ mt: 1, display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#ecfdf5', px: 2, py: 0.5, borderRadius: 10, border: '1px solid #10b981' }}>
                                <Box sx={{ width: 6, height: 6, bgcolor: '#10b981', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                                <Typography variant="caption" sx={{ color: '#065f46', fontWeight: 700 }}>Background Tracking Active</Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ width: 100, height: 100, bgcolor: '#f1f5f9', borderRadius: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}><CarIcon sx={{ fontSize: 50, color: '#94a3b8' }} /></Box>
                            <Typography variant="h5" fontWeight="800">Vehicle Ready</Typography>
                            <TextField fullWidth placeholder="Job ID / Route Name (Optional)" value={tripName} onChange={(e) => setTripName(e.target.value)} sx={{ mt: 3, '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: '#f8fafc' } }} />
                        </Box>
                    )}

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 4 }}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="700">CURRENT SPEED</Typography>
                            <Typography variant="h5" fontWeight="800">{currentPoint ? formatSpeed(currentPoint.speed) : '0.0 km/h'}</Typography>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="700">ELAPSED TIME</Typography>
                            <Typography variant="h5" fontWeight="800">{formatDuration(duration)}</Typography>
                        </Paper>
                    </Box>

                    {!isTracking ? 
                        <Button variant="contained" size="large" fullWidth onClick={startTracking} sx={{ py: 2.5, borderRadius: 5, fontSize: '1.2rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', textTransform: 'none' }}>Start Tracking Session</Button> :
                        <Button variant="contained" color="error" size="large" fullWidth onClick={stopTracking} sx={{ py: 2.5, borderRadius: 5, fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'none' }}>End Tracking Session</Button>
                    }
                </Paper>
            </Box>
        </Fade>
    );

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Container maxWidth="sm" sx={{ py: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="900" sx={{ color: '#0f172a', letterSpacing: '-0.03em' }}>SPEEDO TRACKER</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">{deviceName}</Typography>
                        <IconButton size="small" onClick={() => { localStorage.removeItem('speedo_device_secret'); setAppState('error'); }}><PowerIcon sx={{ fontSize: 18, color: '#ef4444' }} /></IconButton>
                    </Box>
                </Box>
                {view === 'track' ? renderTrack() : renderOverview()}
            </Container>

            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderRadius: '24px 24px 0 0', overflow: 'hidden', boxShadow: '0 -10px 40px rgba(0,0,0,0.05)' }} elevation={3}>
                <BottomNavigation showLabels value={view} onChange={(_, newValue) => setView(newValue)} sx={{ height: 72 }}>
                    <BottomNavigationAction value="track" label="Record" icon={<GpsFixedIcon />} />
                    <BottomNavigationAction value="overview" label="Dashboard" icon={<DashboardIcon />} />
                </BottomNavigation>
            </Paper>

            <style>{`
                .tracking-pulse-container { position: relative; display: inline-flex; }
                .tracking-pulse-container::after { content: ""; position: absolute; top: -15px; left: -15px; right: -15px; bottom: -15px; border-radius: 50%; border: 2px solid #10b981; animation: pulse 2s infinite; }
                .tracking-pulse-core { width: 100px; height: 100px; background: #10b981; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3); }
                @keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
            `}</style>
        </Box>
    );
};

export default MobileTracker;
