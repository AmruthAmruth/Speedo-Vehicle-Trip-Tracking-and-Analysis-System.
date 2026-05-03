import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Button, 
    Paper, 
    Container, 
    Alert,
    IconButton
} from '@mui/material';
import { 
    MyLocation as GpsFixedIcon, 
    Stop as StopIcon, 
    ArrowBack as ArrowBackIcon,
    Speed as SpeedIcon,
    Timer as TimerIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { socketService } from '../../../services/socketService';
import { tripApi } from '../../../services/tripApi';
import { formatSpeed, formatDuration } from '../../../utils/tripUtils';
import { toast } from 'react-toastify';

const MobileTracker: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [activeTripId, setActiveTripId] = useState<string | null>(id && id !== 'new' ? id : null);
    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState<'idle' | 'tracking' | 'error' | 'finished'>('idle');
    const [error, setError] = useState<string | null>(null);
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

    const startTracking = async () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setError(null);
        
        let currentId = activeTripId;
        
        // If no trip ID exists (e.g., scanned 'new' QR), create it now
        if (!currentId) {
            try {
                const response = await tripApi.startLiveTrip();
                currentId = response.trip._id;
                setActiveTripId(currentId);
                // socketService.joinTrip(currentId); // Handled by useEffect
            } catch (err) {
                console.error("Failed to start live trip:", err);
                setError("Failed to initialize trip session. Please check your connection.");
                return;
            }
        }

        setIsTracking(true);
        setStatus('tracking');

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

    if (status === 'finished') {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <Paper elevation={3} sx={{ p: 6, borderRadius: 6 }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 100, mb: 3 }} />
                    <Typography variant="h4" fontWeight="bold" gutterBottom>Trip Completed!</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Your trip data has been successfully saved and processed.
                    </Typography>
                    <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 4, mb: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Total Duration</Typography>
                            <Typography variant="h6" fontWeight="bold">{formatDuration(duration)}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Points Captured</Typography>
                            <Typography variant="h6" fontWeight="bold">Live</Typography>
                        </Box>
                    </Box>
                    <Button 
                        variant="contained" 
                        fullWidth 
                        size="large"
                        onClick={() => navigate('/dashboard')}
                        sx={{ borderRadius: 3, py: 2, fontWeight: 'bold' }}
                    >
                        Go to Dashboard
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold">Mobile Tracker</Typography>
            </Box>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {status === 'tracking' ? (
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ 
                            position: 'relative', 
                            display: 'inline-flex', 
                            mb: 2,
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                borderRadius: '50%',
                                border: '4px solid #4caf50',
                                animation: 'pulse 2s infinite'
                            }
                        }}>
                            <Box sx={{ p: 3, bgcolor: 'success.light', borderRadius: '50%' }}>
                                <GpsFixedIcon sx={{ fontSize: 60, color: 'white' }} />
                            </Box>
                        </Box>
                        <Typography variant="h6" color="success.main" fontWeight="600" gutterBottom>
                            LIVE TRACKING ACTIVE
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ p: 3, bgcolor: 'grey.200', borderRadius: '50%', display: 'inline-flex' }}>
                            <GpsFixedIcon sx={{ fontSize: 60, color: 'grey.500' }} />
                        </Box>
                        <Typography variant="h6" color="text.secondary" fontWeight="600" gutterBottom sx={{ mt: 2 }}>
                            READY TO TRACK
                        </Typography>
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <SpeedIcon color="primary" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">Current Speed</Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {currentPoint ? formatSpeed(currentPoint.speed) : '0.0 km/h'}
                        </Typography>
                    </Paper>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <TimerIcon color="secondary" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">Duration</Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {formatDuration(duration)}
                        </Typography>
                    </Paper>
                </Box>

                {!isTracking ? (
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={startTracking}
                        startIcon={<GpsFixedIcon />}
                        sx={{ 
                            py: 2, 
                            borderRadius: 3, 
                            fontSize: '1.1rem', 
                            fontWeight: 'bold',
                            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)'
                        }}
                    >
                        Start Live Tracking
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
                            py: 2, 
                            borderRadius: 3, 
                            fontSize: '1.1rem', 
                            fontWeight: 'bold'
                        }}
                    >
                        End Trip
                    </Button>
                )}
            </Paper>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
            `}</style>
        </Container>
    );
};

export default MobileTracker;
