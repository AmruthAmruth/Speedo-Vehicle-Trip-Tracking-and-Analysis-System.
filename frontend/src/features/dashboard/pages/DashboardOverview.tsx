import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    Typography, 
    IconButton, 
    Box,
    Button
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { tripApi } from '../../../services/tripApi';
import { Trip } from '../../../types/trip.types';
import { formatDistance, formatDuration, calculateTripDuration } from '../../../utils/tripUtils';
import { toast } from 'react-toastify';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RouteIcon from '@mui/icons-material/Route';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';

const DashboardOverview: React.FC = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [activeTripId, setActiveTripId] = useState<string | null>(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            const response = await tripApi.getUserTrips();
            setTrips(response.trips);
        } catch (error) {
            console.error('Failed to load trips:', error);
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
            // Refresh list to show new active trip
            loadTrips();
        } catch (error) {
            console.error('Failed to start live trip:', error);
            toast.error('Failed to start live trip');
        }
    };

    const calculateStats = () => {
        const totalTrips = trips.length;
        const totalDistance = trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0);
        const totalDuration = trips.reduce((sum, trip) =>
            sum + calculateTripDuration(trip.startTime, trip.endTime), 0
        );
        const totalIdling = trips.reduce((sum, trip) => sum + (trip.totalIdlingTime || 0), 0);

        return {
            totalTrips,
            totalDistance,
            totalDuration,
            totalIdling,
        };
    };

    const stats = calculateStats();
    const recentTrips = trips.slice(0, 5);

    // Construct the live tracking URL for mobile
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
        <div className="dashboard-overview">
            {/* Welcome Section */}
            <div className="welcome-section mb-8">
                <h2 className="text-3xl font-bold text-text-primary mb-2">
                    Welcome to Your Dashboard
                </h2>
                <p className="text-base text-text-secondary">
                    Track and analyze your vehicle trips with precision
                </p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <DashboardIcon style={{ fontSize: 28 }} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Trips</p>
                        <h3 className="stat-value">{stats.totalTrips}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon bg-gradient-to-br from-accent-violet to-accent-rose">
                        <RouteIcon style={{ fontSize: 28 }} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Distance</p>
                        <h3 className="stat-value">{formatDistance(stats.totalDistance)}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon bg-gradient-to-br from-accent-blue to-accent-teal">
                        <AccessTimeIcon style={{ fontSize: 28 }} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Duration</p>
                        <h3 className="stat-value">{formatDuration(stats.totalDuration)}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon bg-gradient-to-br from-accent-rose to-accent-amber">
                        <SpeedIcon style={{ fontSize: 28 }} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Idling</p>
                        <h3 className="stat-value">{formatDuration(stats.totalIdling)}</h3>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card" style={{ marginBottom: '30px' }}>
                <div className="card-header">
                    <h3 className="card-title">Quick Actions</h3>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <button className="btn-primary" onClick={() => navigate('/dashboard/upload')}>
                        <UploadFileIcon />
                        Upload New Trip
                    </button>
                    <button 
                        className="btn-primary" 
                        style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}
                        onClick={handleStartLiveTracking}
                    >
                        <GpsFixedIcon />
                        Start Live Tracking
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/dashboard/trips')}>
                        View All Trips
                    </button>
                </div>
            </div>

            {/* Recent Trips */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Recent Trips</h3>
                        <p className="card-subtitle">Your latest 5 trips</p>
                    </div>
                    <button className="btn-secondary" onClick={() => navigate('/dashboard/trips')}>
                        View All
                    </button>
                </div>

                {recentTrips.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📍</div>
                        <h4 className="empty-title">No trips yet</h4>
                        <p className="empty-description">Upload your first GPS trip data to get started</p>
                        <button className="btn-primary" onClick={() => navigate('/dashboard/upload')}>
                            <UploadFileIcon />
                            Upload Trip
                        </button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-light-border">
                                    <th className="p-3 text-left text-text-secondary font-semibold">Trip Name</th>
                                    <th className="p-3 text-left text-text-secondary font-semibold">Date</th>
                                    <th className="p-3 text-left text-text-secondary font-semibold">Distance</th>
                                    <th className="p-3 text-left text-text-secondary font-semibold">Duration</th>
                                    <th className="p-3 text-left text-text-secondary font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTrips.map((trip) => (
                                    <tr key={trip._id} className="border-b border-light-border hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span className="font-semibold text-text-primary">{trip.name}</span>
                                                {trip.isActive && (
                                                    <span style={{
                                                        background: '#EF4444',
                                                        color: 'white',
                                                        fontSize: '10px',
                                                        fontWeight: 800,
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        animation: 'pulse-live 2s infinite'
                                                    }}>
                                                        LIVE
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-text-secondary">
                                            {new Date(trip.startTime).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-text-secondary">
                                            {formatDistance(trip.totalDistance)}
                                        </td>
                                        <td className="p-4 text-text-secondary">
                                            {trip.isActive ? 'Ongoing' : formatDuration(calculateTripDuration(trip.startTime, trip.endTime))}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                className="btn-secondary text-sm px-4 py-2"
                                                onClick={() => navigate(`/dashboard/trips/${trip._id}`)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

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

            <style>{`
                @keyframes pulse-live {
                    0% { opacity: 1; }
                    50% { opacity: 0.6; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default DashboardOverview;
