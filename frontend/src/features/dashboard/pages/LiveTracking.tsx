import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../../../services/tripApi';
import { Trip } from '../../../types/trip.types';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CloseIcon from '@mui/icons-material/Close';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    Typography, 
    IconButton, 
    Box,
    Button
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from '../../../utils/tripUtils';
import { toast } from 'react-toastify';

const LiveTracking: React.FC = () => {
    const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [activeTripId, setActiveTripId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadActiveTrips();
        // Poll for new active trips every 30 seconds
        const interval = setInterval(loadActiveTrips, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadActiveTrips = async () => {
        try {
            const trips = await tripApi.getActiveTrips();
            setActiveTrips(trips);
        } catch (error) {
            console.error('Failed to load active trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartLiveTracking = async () => {
        try {
            const response = await tripApi.startLiveTrip();
            setActiveTripId(response.trip._id);
            setQrModalOpen(true);
            toast.success('Live trip started! Scan the QR code to link your phone.');
            loadActiveTrips();
        } catch (error) {
            console.error('Failed to start live trip:', error);
            toast.error('Failed to start live trip');
        }
    };

    const trackingUrl = activeTripId 
        ? `${window.location.origin}/dashboard/track/${activeTripId}`
        : '';

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="live-tracking-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>Active Fleet</h2>
                    <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Monitoring {activeTrips.length} vehicles in real-time</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                        className="btn-primary" 
                        onClick={handleStartLiveTracking}
                        style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}
                    >
                        <GpsFixedIcon /> Start New Tracking
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', padding: '8px 16px', borderRadius: '20px' }}>
                        <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', animation: 'pulse-green 2s infinite' }}></span>
                        <span style={{ color: '#059669', fontSize: '14px', fontWeight: 600 }}>System Live</span>
                    </div>
                </div>
            </div>

            {activeTrips.length === 0 ? (
                <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ display: 'inline-flex', padding: '24px', background: '#f3f4f6', borderRadius: '50%', marginBottom: '16px' }}>
                        <DirectionsCarIcon style={{ fontSize: 48, color: '#9ca3af' }} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>No active trips found</h3>
                    <p style={{ color: '#6b7280', maxWidth: '400px', margin: '8px auto 24px' }}>
                        When you start tracking from your mobile or run a simulation, they will appear here.
                    </p>
                    <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                        Go to Overview
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {activeTrips.map(trip => (
                        <div key={trip._id} className="dashboard-card" style={{ borderLeft: '4px solid #10b981' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{trip.name}</h4>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>Started {formatDate(trip.startTime)}</p>
                                </div>
                                <GpsFixedIcon style={{ color: '#10b981' }} />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>Status</p>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#059669' }}>Transmitting</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>Mode</p>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{trip.metadata?.source === 'simulation' ? 'Simulation' : 'Live Mobile'}</p>
                                </div>
                            </div>

                            <button 
                                className="btn-primary" 
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => navigate(`/dashboard/trips/${trip._id}`)}
                            >
                                <PlayArrowIcon /> Watch Live Feed
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes pulse-green {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
            `}</style>

            {/* QR Code Handshake Modal */}
            <Dialog 
                open={qrModalOpen} 
                onClose={() => setQrModalOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 4, p: 2, maxWidth: '400px' }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Link Mobile Device</Typography>
                    <IconButton onClick={() => setQrModalOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 2 }}>
                        <Box sx={{ 
                            p: 3, 
                            bgcolor: 'white', 
                            borderRadius: 4, 
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            mb: 3
                        }}>
                            <QRCodeSVG value={trackingUrl} size={250} level="H" includeMargin />
                        </Box>
                        <Typography variant="body1" color="text.primary" fontWeight="600" gutterBottom>
                            Scan to start tracking
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Open your phone camera or QR scanner to link this trip session to your mobile device.
                        </Typography>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            onClick={() => navigate(`/dashboard/trips/${activeTripId}`)}
                            sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
                        >
                            Open Dashboard View
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LiveTracking;

