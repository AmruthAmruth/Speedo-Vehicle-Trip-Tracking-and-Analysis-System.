import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Button, 
    Paper, 
    Container, 
    Alert,
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
    Devices as DevicesIcon,
    DirectionsCar as CarIcon,
    PowerSettingsNew as PowerIcon,
    Dashboard as DashboardIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { socketService } from '../../../services/socketService';
import { tripApi } from '../../../services/tripApi';
import { authApi } from '../../../services/authApi';
import { formatSpeed, formatDuration } from '../../../utils/tripUtils';
import { toast } from 'react-toastify';
import { Trip } from '../../../types/trip.types';

const MobileTracker: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // UI State
    const [view, setView] = useState<'track' | 'overview'>('track');
    
    // Persistence state
    const [deviceName, setDeviceName] = useState<string>(localStorage.getItem('speedo_device_name') || '');
    const [isDeviceSetup, setIsDeviceSetup] = useState<boolean>(!!localStorage.getItem('speedo_device_token'));
    const [tripName, setTripName] = useState<string>('');
    
    const [activeTripId, setActiveTripId] = useState<string | null>(id && id !== 'new' ? id : null);
    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState<'idle' | 'tracking' | 'error' | 'finished'>('idle');
    const [error, setError] = useState<string | null>(null);
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

    // Initial Authentication check
    useEffect(() => {
        const checkAuth = async () => {
            const deviceId = localStorage.getItem('speedo_device_id');
            const deviceToken = localStorage.getItem('speedo_device_token');

            if (deviceId && deviceToken) {
                try {
                    const response = await authApi.validateDevice({ deviceId, deviceToken });
                    localStorage.setItem('accessToken', response.accessToken);
                    localStorage.setItem('refreshToken', response.refreshToken);
                    localStorage.setItem('user', JSON.stringify(response.user));
                    setIsDeviceSetup(true);
                    loadRecentTrips();
                } catch (err) {
                    console.error("Device validation failed:", err);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

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
        if (activeTripId) {
            socketService.joinTrip(activeTripId);
        }

        return () => {
            if (isTracking) stopTracking();
        };
    }, [activeTripId]);

    const handleDeviceSetup = async () => {
        if (!deviceName.trim()) {
            toast.warn('Please provide a name for this device');
            return;
        }

        const userStr = localStorage.getItem('user');
        if (!userStr) {
            toast.error('You must be logged in to link this device');
            navigate('/login');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            const deviceId = localStorage.getItem('speedo_device_id') || crypto.randomUUID();
            
            const response = await authApi.registerDevice({
                userId: user.id,
                deviceId: deviceId,
                deviceName: deviceName
            });

            localStorage.setItem('speedo_device_id', deviceId);
            localStorage.setItem('speedo_device_token', response.deviceToken);
            localStorage.setItem('speedo_device_name', deviceName);
            
            setIsDeviceSetup(true);
            toast.success(`Device securely linked: ${deviceName}`);
        } catch (err) {
            console.error("Failed to link device:", err);
            toast.error("Failed to link device. Please try again.");
        }
    };

    const startTracking = async () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        setError(null);
        
        let currentId = activeTripId;
        
        if (!currentId) {
            try {
                const response = await tripApi.startLiveTrip(
                    tripName || undefined, 
                    { 
                        source: 'mobile', 
                        deviceName: deviceName 
                    }
                );
                currentId = response.trip._id;
                setActiveTripId(currentId);
            } catch (err: any) {
                console.error("Failed to start live trip:", err);
                if (err.response?.status === 401) {
                    setError("Session expired. Please log in again.");
                    setIsDeviceSetup(false);
                } else {
                    setError("Failed to initialize trip session.");
                }
                setLoading(false);
                return;
            }
        }

        setIsTracking(true);
        setStatus('tracking');
        setLoading(false);

        timerRef.current = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, speed, heading } = position.coords;
                const timestamp = position.timestamp;
                
                const point = {
                    latitude,
                    longitude,
                    speed: (speed || 0) * 3.6,
                    heading: heading || 0,
                    timestamp: new Date(timestamp).toISOString(),
                    ignition: true 
                };

                setCurrentPoint({
                    latitude,
                    longitude,
                    speed: point.speed,
                    timestamp: point.timestamp
                });

                if (currentId) {
                    socketService.emitLocationUpdate(currentId, point);
                }
            },
            (err) => {
                console.error("📍 Geolocation Error:", err);
                setError(`Location Error: ${err.message}`);
                setStatus('error');
            },
            options
        );
    };

    const stopTracking = async () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setIsTracking(false);

        if (activeTripId) {
            try {
                await tripApi.stopLiveTrip(activeTripId);
                toast.success('Trip saved successfully!');
                setStatus('finished');
                loadRecentTrips();
            } catch (err) {
                console.error("Failed to stop live trip:", err);
                toast.error('Failed to save trip');
                setStatus('idle');
            }
        } else {
            setStatus('idle');
        }
    };

    if (loading && !isTracking) {
        return (
            <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    const renderOverview = () => (
        <Fade in timeout={400}>
            <Box sx={{ pb: 10 }}>
                <Typography variant="h5" fontWeight="800" sx={{ mb: 3, color: '#0f172a' }}>Fleet Overview</Typography>
                
                <Paper elevation={0} sx={{ p: 3, borderRadius: 6, mb: 3, bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <DevicesIcon color="primary" />
                        <Typography variant="h6" fontWeight="700">This Device</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">Name: <strong>{deviceName}</strong></Typography>
                    <Typography variant="body2" color="text.secondary">Status: <span style={{ color: '#10b981', fontWeight: 700 }}>Linked</span></Typography>
                </Paper>

                <Typography variant="h6" fontWeight="700" sx={{ mb: 2, color: '#475569' }}>Recent Activity</Typography>
                <Paper elevation={0} sx={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <List sx={{ p: 0 }}>
                        {recentTrips.length === 0 ? (
                            <ListItem><ListItemText primary="No recent trips found." /></ListItem>
                        ) : (
                            recentTrips.map((trip, index) => (
                                <React.Fragment key={trip._id}>
                                    <ListItem 
                                        sx={{ py: 2, bgcolor: trip.isActive ? '#f0fdf4' : 'transparent' }}
                                        secondaryAction={
                                            <IconButton edge="end" onClick={() => navigate(`/dashboard/trips/${trip._id}`)}>
                                                <HistoryIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText 
                                            primary={trip.name || `Trip ${new Date(trip.startTime).toLocaleDateString()}`}
                                            secondary={`${(trip.totalDistance || 0).toFixed(1)} km • ${new Date(trip.startTime).toLocaleTimeString()}`}
                                            primaryTypographyProps={{ fontWeight: 700 }}
                                        />
                                    </ListItem>
                                    {index < recentTrips.length - 1 && <Divider />}
                                </React.Fragment>
                            ))
                        )}
                    </List>
                </Paper>
            </Box>
        </Fade>
    );

    const renderTrack = () => (
        <Fade in timeout={400}>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Paper elevation={0} sx={{ 
                    p: 4, 
                    borderRadius: 8, 
                    textAlign: 'center', 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                    mb: 4
                }}>
                    {status === 'tracking' ? (
                        <Box sx={{ mb: 4 }}>
                            <Box className="tracking-pulse-container">
                                <Box className="tracking-pulse-core">
                                    <GpsFixedIcon sx={{ fontSize: 50, color: 'white' }} />
                                </Box>
                            </Box>
                            <Typography variant="h6" color="#10b981" fontWeight="800" sx={{ mt: 3 }}>
                                LIVE TRACKING
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ 
                                width: 100, 
                                height: 100, 
                                bgcolor: '#f1f5f9', 
                                borderRadius: '32px', 
                                display: 'inline-flex',
                                alignItems: 'center', 
                                justifyContent: 'center',
                                mb: 3
                            }}>
                                <CarIcon sx={{ fontSize: 50, color: '#94a3b8' }} />
                            </Box>
                            <Typography variant="h5" fontWeight="800">Ready to Start</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Tap the button below to begin tracking</Typography>
                            
                            <TextField
                                fullWidth
                                placeholder="Trip Name (Optional)"
                                value={tripName}
                                onChange={(e) => setTripName(e.target.value)}
                                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: '#f8fafc' } }}
                            />
                        </Box>
                    )}

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 4 }}>{error}</Alert>}

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 4 }}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="700">SPEED</Typography>
                            <Typography variant="h5" fontWeight="800">{currentPoint ? formatSpeed(currentPoint.speed) : '0.0 km/h'}</Typography>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="700">TIME</Typography>
                            <Typography variant="h5" fontWeight="800">{formatDuration(duration)}</Typography>
                        </Paper>
                    </Box>

                    {!isTracking ? (
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={startTracking}
                            sx={{ 
                                py: 2.5, 
                                borderRadius: 5, 
                                fontSize: '1.2rem', 
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                textTransform: 'none'
                            }}
                        >
                            {activeTripId ? 'Resume Tracking' : 'Start Live Tracking'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="error"
                            size="large"
                            fullWidth
                            onClick={stopTracking}
                            sx={{ 
                                py: 2.5, 
                                borderRadius: 5, 
                                fontSize: '1.2rem', 
                                fontWeight: 'bold',
                                textTransform: 'none'
                            }}
                        >
                            End Trip
                        </Button>
                    )}
                </Paper>
            </Box>
        </Fade>
    );

    if (!isDeviceSetup && !localStorage.getItem('accessToken')) {
        return (
            <Container maxWidth="sm" sx={{ py: 6, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: '#f8fafc' }}>
                <Fade in timeout={800}>
                    <Paper elevation={0} sx={{ p: 5, borderRadius: 8, textAlign: 'center', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                        <Box sx={{ width: 80, height: 80, bgcolor: 'primary.main', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <DevicesIcon sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography variant="h4" fontWeight="800" gutterBottom>Secure Access</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Please log in to securely link this device for PWA tracking.</Typography>
                        <Button variant="contained" fullWidth size="large" onClick={() => navigate('/login')} sx={{ borderRadius: 4, py: 2, fontWeight: 'bold' }}>Log In to Continue</Button>
                    </Paper>
                </Fade>
            </Container>
        );
    }

    if (!isDeviceSetup) {
        return (
            <Container maxWidth="sm" sx={{ py: 6, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: '#f8fafc' }}>
                <Fade in timeout={800}>
                    <Paper elevation={0} sx={{ p: 5, borderRadius: 8, textAlign: 'center', background: 'white', border: '1px solid #e2e8f0' }}>
                        <Box sx={{ mb: 3 }}><DevicesIcon sx={{ fontSize: 60, color: '#6366f1' }} /></Box>
                        <Typography variant="h4" fontWeight="800" gutterBottom>Link Device</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Register this device as a persistent tracker.</Typography>
                        <TextField fullWidth label="Device Name" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} sx={{ mb: 4 }} />
                        <Button variant="contained" fullWidth size="large" onClick={handleDeviceSetup} sx={{ borderRadius: 4, py: 2, fontWeight: 'bold' }}>Confirm & Enable PWA</Button>
                    </Paper>
                </Fade>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Container maxWidth="sm" sx={{ py: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 32, height: 32, bgcolor: '#0f172a', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CarIcon sx={{ fontSize: 18, color: 'white' }} />
                        </Box>
                        <Typography variant="h6" fontWeight="900" sx={{ color: '#0f172a', letterSpacing: '-0.03em' }}>SPEEDO</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">{deviceName}</Typography>
                        <IconButton size="small" onClick={() => { localStorage.removeItem('speedo_device_token'); setIsDeviceSetup(false); }}>
                            <PowerIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                        </IconButton>
                    </Box>
                </Box>

                {view === 'track' ? renderTrack() : renderOverview()}
            </Container>

            {/* PWA Navigation */}
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderRadius: '24px 24px 0 0', overflow: 'hidden', boxShadow: '0 -10px 40px rgba(0,0,0,0.05)' }} elevation={3}>
                <BottomNavigation
                    showLabels
                    value={view}
                    onChange={(_, newValue) => setView(newValue)}
                    sx={{ height: 72 }}
                >
                    <BottomNavigationAction value="track" label="Track" icon={<GpsFixedIcon />} />
                    <BottomNavigationAction value="overview" label="Overview" icon={<DashboardIcon />} />
                </BottomNavigation>
            </Paper>

            <style>{`
                .tracking-pulse-container { position: relative; display: inline-flex; }
                .tracking-pulse-container::after {
                    content: ""; position: absolute; top: -15px; left: -15px; right: -15px; bottom: -15px;
                    border-radius: 50%; border: 2px solid #10b981; animation: pulse 2s infinite;
                }
                .tracking-pulse-core {
                    width: 100px; height: 100px; background: #10b981; border-radius: 50%;
                    display: flex; alignItems: center; justifyContent: center;
                    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
                }
                @keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
            `}</style>
        </Box>
    );
};

export default MobileTracker;
