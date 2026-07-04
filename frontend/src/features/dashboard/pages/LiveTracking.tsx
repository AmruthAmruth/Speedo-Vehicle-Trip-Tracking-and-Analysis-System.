import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../../../services/tripApi';
import { authApi } from '../../../services/authApi';
import { Trip } from '../../../types/trip.types';
import { useAuth } from '../../../context/AuthContext';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import SensorsIcon from '@mui/icons-material/Sensors';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
    Dialog,
    IconButton,
    CircularProgress,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import { socketService } from '../../../services/socketService';
import {
  Button,
  Card,
  Badge,
} from '../../../components/shared/ui';

const LiveTracking: React.FC = () => {
    const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
    const [previousLiveTrips, setPreviousLiveTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [pairingToken, setPairingToken] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [qrError, setQrError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const loadTrips = useCallback(async () => {
        try {
            const response = await tripApi.getUserTrips();
            const allTrips = response.trips;

            const sortedTrips = [...allTrips].sort((a, b) =>
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            );

            const active = sortedTrips.filter(t => t.isActive);
            const previous = sortedTrips.filter(t =>
                !t.isActive &&
                (t.metadata?.source === 'simulation' || t.metadata?.source === 'mobile')
            ).slice(0, 5);

            setActiveTrips(active);
            setPreviousLiveTrips(previous);
        } catch (error) {
            console.error('Failed to load trips:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTrips();

        const socket = socketService.connect();

        // Join user room using AuthContext instead of reading localStorage directly
        if (user?.id) {
            socketService.joinUserRoom(user.id);
        }

        const handleTripStarted = (trip: Trip) => {
            setActiveTrips(prev => {
                if (prev.find(t => t._id === trip._id)) return prev;
                return [trip, ...prev];
            });
            toast.info(`New tracking session started: ${trip.name}`);
        };

        const handleTripStopped = (trip: Trip) => {
            setActiveTrips(prev => prev.filter(t => t._id !== trip._id));
            setPreviousLiveTrips(prev => [trip, ...prev].slice(0, 5));
            toast.success(`Tracking session ended: ${trip.name}`);
        };

        socket.on('TRIP_STARTED', handleTripStarted);
        socket.on('TRIP_STOPPED', handleTripStopped);

        const interval = setInterval(loadTrips, 30000);

        return () => {
            clearInterval(interval);
            // Clean up socket listeners on unmount to prevent memory leaks
            socket.off('TRIP_STARTED', handleTripStarted);
            socket.off('TRIP_STOPPED', handleTripStopped);
        };
    }, [loadTrips, user?.id]);

    const handleStartLiveTracking = useCallback(async () => {
        setQrModalOpen(true);
        setIsGenerating(true);
        setQrError(null);
        setPairingToken(null);

        try {
            const response = await authApi.getPairingToken();
            if (response && response.pairingToken) {
                setPairingToken(response.pairingToken);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Failed to get pairing token:', err);
            setQrError('Could not generate pairing token. Please check your connection.');
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const trackingUrl = pairingToken
        ? `${window.location.origin}/dashboard/track/p/${pairingToken}`
        : `${window.location.origin}/dashboard/track/new`;

    const copyToClipboard = useCallback(() => {
        if (trackingUrl) {
            navigator.clipboard.writeText(trackingUrl);
            toast.success('Link copied to clipboard!');
        }
    }, [trackingUrl]);

    const renderTripCard = useCallback((trip: Trip) => (
        <Card
            key={trip._id}
            className="cursor-pointer overflow-hidden border-slate-100"
            onClick={() => navigate(`/dashboard/trips/${trip._id}`)}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <Badge variant="success" pulse size="sm">LIVE</Badge>
                    <h4 className="text-lg font-bold text-slate-900 line-clamp-1">{trip.name}</h4>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {trip.metadata?.deviceName || 'Primary Device'}
                    </p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                    <DirectionsCarIcon sx={{ fontSize: 20, color: '#94a3b8' }} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Started</span>
                    <p className="text-sm font-semibold text-slate-700">
                        {new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Mode</span>
                    <p className="text-sm font-semibold text-slate-700">
                        {trip.metadata?.source === 'simulation' ? 'Simulation' : 'Live GPS'}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-brand-500 font-bold text-xs uppercase tracking-widest group">
                <span>View Real-time Feed</span>
                <ArrowForwardIosIcon sx={{ fontSize: 10 }} className="transition-transform group-hover:translate-x-1" />
            </div>
        </Card>
    ), [navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-brand-500" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Initializing feed...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div className="space-y-2">
                    <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Live Tracking</h1>
                    <p className="text-slate-500 text-lg">Monitor your fleet's active sessions in real-time.</p>
                </div>
                <Button
                    size="lg"
                    onClick={handleStartLiveTracking}
                    leftIcon={<GpsFixedIcon sx={{ fontSize: 20 }} />}
                    className="shadow-glow"
                >
                    Start New Session
                </Button>
            </header>

            <main className="space-y-16">
                {/* Active Section */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <h2 className="text-xl font-bold text-slate-800">Active Vehicles</h2>
                        <Badge variant="secondary">{activeTrips.length}</Badge>
                    </div>

                    {activeTrips.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center">
                            <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                                <SensorsIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
                            </div>
                            <p className="text-slate-500 font-medium mb-6">No active sessions found. Start tracking to see live data.</p>
                            <Button variant="outline" onClick={handleStartLiveTracking}>
                                Initiate Tracking
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeTrips.map(trip => renderTripCard(trip))}
                        </div>
                    )}
                </section>

                {/* History Section */}
                {previousLiveTrips.length > 0 && (
                    <section className="animate-slide-up">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-premium">
                            {previousLiveTrips.map((trip, idx) => (
                                <div
                                    key={trip._id}
                                    className={`flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors ${idx !== previousLiveTrips.length - 1 ? 'border-b border-slate-50' : ''}`}
                                    onClick={() => navigate(`/dashboard/trips/${trip._id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-brand-500 transition-colors">
                                            <HistoryIcon sx={{ fontSize: 20 }} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{trip.name}</p>
                                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                                {trip.metadata?.deviceName || 'Mobile'} • {new Date(trip.startTime).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-700">{(trip.totalDistance || 0).toFixed(1)} km</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Distance</p>
                                        </div>
                                        <ArrowForwardIosIcon sx={{ fontSize: 12, color: '#cbd5e1' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* QR Modal */}
            <Dialog
                open={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        maxWidth: '440px',
                        width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                        m: 2
                    }
                }}
            >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-display font-bold text-slate-900">Link Device</h3>
                        <IconButton
                            onClick={() => setQrModalOpen(false)}
                            size="small"
                            className="hover:bg-slate-100 rounded-full"
                        >
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-8 w-full max-w-[240px] aspect-square flex items-center justify-center">
                            {isGenerating ? (
                                <CircularProgress size={48} thickness={4} sx={{ color: '#435cf0' }} />
                            ) : qrError ? (
                                <div className="space-y-3">
                                    <ErrorOutlineIcon sx={{ fontSize: 48, color: '#ef4444' }} />
                                    <p className="text-sm font-medium text-error">{qrError}</p>
                                </div>
                            ) : (
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                    <QRCodeSVG value={trackingUrl} size={180} level="M" />
                                </div>
                            )}
                        </div>

                        {!qrError && !isGenerating && (
                            <div className="space-y-6 w-full">
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    Scan the code with your mobile device to link it instantly and start tracking.
                                </p>

                                <Button
                                    variant="outline"
                                    className="w-full py-6 rounded-2xl border-slate-200"
                                    leftIcon={<ContentCopyIcon sx={{ fontSize: 18 }} />}
                                    onClick={copyToClipboard}
                                >
                                    Copy Link
                                </Button>

                                <Button className="w-full py-6 rounded-2xl" onClick={() => setQrModalOpen(false)}>
                                    Done
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default LiveTracking;
