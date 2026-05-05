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
    InputAdornment,
    Fade,
    CircularProgress
} from '@mui/material';
import { 
    MyLocation as GpsFixedIcon, 
    Stop as StopIcon, 
    ArrowBack as ArrowBackIcon,
    Speed as SpeedIcon,
    Timer as TimerIcon,
    CheckCircle as CheckCircleIcon,
    Edit as EditIcon,
    Devices as DevicesIcon,
    DirectionsCar as CarIcon
} from '@mui/icons-material';
import { socketService } from '../../../services/socketService';
import { tripApi } from '../../../services/tripApi';
import { formatSpeed, formatDuration } from '../../../utils/tripUtils';
import { toast } from 'react-toastify';

const MobileTracker: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // Persistence state
    const [deviceName, setDeviceName] = useState<string>(localStorage.getItem('speedo_device_name') || '');
    const [isDeviceSetup, setIsDeviceSetup] = useState<boolean>(!!localStorage.getItem('speedo_device_name'));
    const [tripName, setTripName] = useState<string>('');
    
    const [activeTripId, setActiveTripId] = useState<string | null>(id && id !== 'new' ? id : null);
    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState<'idle' | 'tracking' | 'error' | 'finished'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPoint, setCurrentPoint] = useState<{
        latitude: number;
        longitude: number;
        speed: number;
        timestamp: string;
    } | null>(null);
    const [duration, setDuration] = useState(0);

    const watchIdRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        socketService.connect();
        if (activeTripId) {
            socketService.joinTrip(activeTripId);
        }

        return () => {
            if (isTracking) stopTracking();
        };
    }, [activeTripId]);

    const handleDeviceSetup = () => {
        if (!deviceName.trim()) {
            toast.warn('Please provide a name for this device');
            return;
        }
        localStorage.setItem('speedo_device_name', deviceName);
        setIsDeviceSetup(true);
        toast.success(`Device linked: ${deviceName}`);
    };

    const startTracking = async () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        setError(null);
        
        let currentId = activeTripId;
        
        // If no trip ID exists (e.g., scanned 'new' QR), create it now
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
            } catch (err) {
                console.error("Failed to start live trip:", err);
                setError("Failed to initialize trip session. Please check your connection.");
                setLoading(false);
                return;
            }
        }

        setIsTracking(true);
        setStatus('tracking');
        setLoading(false);

        // Start duration timer
        timerRef.current = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);

        // Options for high accuracy
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
                    speed: (speed || 0) * 3.6, // Convert m/s to km/h
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

                // Emit to server
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
            } catch (err) {
                console.error("Failed to stop live trip:", err);
                toast.error('Failed to save trip');
                setStatus('idle');
            }
        } else {
            setStatus('idle');
        }
    };

    if (!isDeviceSetup) {
        return (
            <Container maxWidth="sm" sx={{ py: 6, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Fade in timeout={800}>
                    <Paper elevation={0} sx={{ 
                        p: 5, 
                        borderRadius: 8, 
                        textAlign: 'center',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                    }}>
                        <Box sx={{ 
                            width: 80, 
                            height: 80, 
                            bgcolor: 'primary.main', 
                            borderRadius: '24px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
                        }}>
                            <DevicesIcon sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                            Link This Device
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            Give this device a name (e.g., "Personal iPhone") so we can identify it in your fleet monitor.
                        </Typography>
                        
                        <TextField
                            fullWidth
                            label="Device Name"
                            placeholder="e.g. My Phone"
                            variant="outlined"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            sx={{ 
                                mb: 4,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 4,
                                    bgcolor: 'white'
                                }
                            }}
                        />

                        <Button 
                            variant="contained" 
                            fullWidth 
                            size="large"
                            onClick={handleDeviceSetup}
                            sx={{ 
                                borderRadius: 4, 
                                py: 2, 
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                textTransform: 'none',
                                fontSize: '1.1rem'
                            }}
                        >
                            Confirm & Link Device
                        </Button>
                    </Paper>
                </Fade>
            </Container>
        );
    }

    if (status === 'finished') {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <Fade in timeout={600}>
                    <Paper elevation={0} sx={{ 
                        p: 6, 
                        borderRadius: 8,
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                    }}>
                        <Box sx={{ mb: 3 }}>
                            <CheckCircleIcon sx={{ fontSize: 100, color: '#10b981' }} />
                        </Box>
                        <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#1e293b' }}>Trip Completed!</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            Great job! Your trip from <strong>{deviceName}</strong> has been successfully archived.
                        </Typography>
                        
                        <Box sx={{ 
                            bgcolor: '#f8fafc', 
                            p: 3, 
                            borderRadius: 6, 
                            mb: 4, 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: 2,
                            border: '1px solid #f1f5f9'
                        }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Duration</Typography>
                                <Typography variant="h5" fontWeight="bold" sx={{ color: '#334155' }}>{formatDuration(duration)}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Status</Typography>
                                <Typography variant="h5" fontWeight="bold" sx={{ color: '#10b981' }}>Saved</Typography>
                            </Box>
                        </Box>
                        
                        <Button 
                            variant="contained" 
                            fullWidth 
                            size="large"
                            onClick={() => navigate('/dashboard')}
                            sx={{ 
                                borderRadius: 4, 
                                py: 2, 
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                textTransform: 'none'
                            }}
                        >
                            Return to Dashboard
                        </Button>
                    </Paper>
                </Fade>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f1f5f9' }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1, bgcolor: 'white', '&:hover': { bgcolor: '#f8fafc' } }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-0.01em' }}>Mobile Tracker</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'white', px: 2, py: 0.5, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    <DevicesIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">{deviceName}</Typography>
                    <IconButton size="small" onClick={() => setIsDeviceSetup(false)}>
                        <EditIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                </Box>
            </Box>

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
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
            }}>
                {status === 'tracking' ? (
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ 
                            position: 'relative', 
                            display: 'inline-flex', 
                            mb: 2,
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: -10,
                                left: -10,
                                right: -10,
                                bottom: -10,
                                borderRadius: '50%',
                                border: '2px solid #10b981',
                                animation: 'pulse-tracking 2s infinite'
                            }
                        }}>
                            <Box sx={{ 
                                width: 100, 
                                height: 100, 
                                bgcolor: '#10b981', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)'
                            }}>
                                <GpsFixedIcon sx={{ fontSize: 50, color: 'white' }} />
                            </Box>
                        </Box>
                        <Typography variant="h6" color="#10b981" fontWeight="800" sx={{ mt: 2, letterSpacing: '0.05em' }}>
                            LIVE TRACKING ACTIVE
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Transmitting high-precision telemetry</Typography>
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
                        <Typography variant="h5" fontWeight="800" sx={{ color: '#1e293b' }}>Ready to Start</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Configure your trip below to begin tracking</Typography>
                        
                        {!isTracking && (
                            <Fade in timeout={400}>
                                <Box sx={{ width: '100%', mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        placeholder="Trip Name (e.g. Morning Commute)"
                                        label="Trip Name"
                                        value={tripName}
                                        onChange={(e) => setTripName(e.target.value)}
                                        disabled={loading}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EditIcon sx={{ color: '#94a3b8' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ 
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 4,
                                                bgcolor: '#f8fafc'
                                            }
                                        }}
                                    />
                                </Box>
                            </Fade>
                        )}
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 4, border: '1px solid #fee2e2' }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 4 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 5, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <SpeedIcon sx={{ mb: 1, color: '#6366f1' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Speed</Typography>
                        <Typography variant="h5" fontWeight="800" sx={{ color: '#1e293b' }}>
                            {currentPoint ? formatSpeed(currentPoint.speed) : '0.0 km/h'}
                        </Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 5, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <TimerIcon sx={{ mb: 1, color: '#ec4899' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Duration</Typography>
                        <Typography variant="h5" fontWeight="800" sx={{ color: '#1e293b' }}>
                            {formatDuration(duration)}
                        </Typography>
                    </Paper>
                </Box>

                {!isTracking ? (
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading}
                        onClick={startTracking}
                        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <GpsFixedIcon />}
                        sx={{ 
                            py: 2.5, 
                            borderRadius: 5, 
                            fontSize: '1.2rem', 
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            boxShadow: '0 12px 24px rgba(79, 70, 229, 0.3)',
                            textTransform: 'none'
                        }}
                    >
                        {loading ? 'Initializing...' : 'Start Live Tracking'}
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="error"
                        size="large"
                        fullWidth
                        onClick={stopTracking}
                        startIcon={<StopIcon />}
                        sx={{ 
                            py: 2.5, 
                            borderRadius: 5, 
                            fontSize: '1.2rem', 
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            boxShadow: '0 12px 24px rgba(239, 68, 68, 0.3)',
                            textTransform: 'none'
                        }}
                    >
                        End This Trip
                    </Button>
                )}
            </Paper>

            <style>{`
                @keyframes pulse-tracking {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(1.4); opacity: 0; }
                }
            `}</style>
        </Container>
    );
};

export default MobileTracker;
