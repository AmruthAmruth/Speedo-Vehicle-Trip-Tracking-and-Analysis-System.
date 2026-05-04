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
import { formatDate, formatDuration, calculateTripDuration } from '../../../utils/tripUtils';
import { toast } from 'react-toastify';

const LiveTracking: React.FC = () => {
    const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
    const [previousLiveTrips, setPreviousLiveTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadTrips();
        // Poll for updates every 30 seconds
        const interval = setInterval(loadTrips, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadTrips = async () => {
        try {
            const response = await tripApi.getUserTrips();
            const allTrips = response.trips;
            
            // Sort by start time descending
            const sortedTrips = [...allTrips].sort((a, b) => 
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            );

            // Separate active and previous live/simulation trips
            const active = sortedTrips.filter(t => t.isActive);
            const previous = sortedTrips.filter(t => 
                !t.isActive && 
                (t.metadata?.source === 'simulation' || t.metadata?.source === 'mobile')
            ).slice(0, 10); // Limit to last 10

            setActiveTrips(active);
            setPreviousLiveTrips(previous);
        } catch (error) {
            console.error('Failed to load trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartLiveTracking = () => {
        setQrModalOpen(true);
    };

    const trackingUrl = `${window.location.origin}/dashboard/track/new`;

    const renderTripCard = (trip: Trip, isLive: boolean = false) => (
        <div 
            key={trip._id} 
            className="dashboard-card" 
            style={{ 
                borderLeft: `4px solid ${isLive ? '#10b981' : '#6366f1'}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
            }}
            onClick={() => navigate(`/dashboard/trips/${trip._id}`)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{trip.name}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                        {isLive ? `Started ${formatDate(trip.startTime)}` : `Tracked on ${new Date(trip.startTime).toLocaleDateString()}`}
                    </p>
                </div>
                {isLive ? (
                    <GpsFixedIcon style={{ color: '#10b981', animation: 'pulse-green 2s infinite' }} />
                ) : (
                    <PlayArrowIcon style={{ color: '#6366f1' }} />
                )}
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Status</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: isLive ? '#10b981' : '#64748b' }}>
                        {isLive ? 'Live' : 'Completed'}
                    </p>
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Source</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                        {trip.metadata?.source === 'simulation' ? 'Simulation' : 'Mobile App'}
                    </p>
                </div>
            </div>

            <button 
                className="btn-primary" 
                style={{ 
                    width: '100%', 
                    justifyContent: 'center',
                    background: isLive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    boxShadow: isLive ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(99, 102, 241, 0.2)'
                }}
            >
                {isLive ? <><GpsFixedIcon style={{ fontSize: 18 }} /> Watch Live Feed</> : <><PlayArrowIcon style={{ fontSize: 18 }} /> Replay Trip</>}
            </button>
        </div>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="live-tracking-container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Live Fleet Monitor</h2>
                    <p style={{ color: '#64748b', fontSize: '16px', margin: '4px 0 0 0' }}>Real-time visualization and historical session tracking</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                        className="btn-primary" 
                        onClick={handleStartLiveTracking}
                        style={{ 
                            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                            padding: '12px 24px',
                            borderRadius: '14px',
                            fontWeight: 700,
                            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)'
                        }}
                    >
                        <GpsFixedIcon /> Start New Tracking
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', padding: '10px 20px', borderRadius: '30px', border: '1px solid #d1fae5' }}>
                        <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', animation: 'pulse-green 2s infinite' }}></span>
                        <span style={{ color: '#065f46', fontSize: '14px', fontWeight: 800 }}>SYSTEM READY</span>
                    </div>
                </div>
            </div>

            {/* Active Fleet Section */}
            <div style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GpsFixedIcon style={{ color: '#10b981', fontSize: 20 }} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Active Fleet ({activeTrips.length})</h3>
                </div>

                {activeTrips.length === 0 ? (
                    <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                        <div style={{ display: 'inline-flex', padding: '24px', background: 'white', borderRadius: '50%', marginBottom: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <DirectionsCarIcon style={{ fontSize: 48, color: '#94a3b8' }} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#334155' }}>No active vehicles</h3>
                        <p style={{ color: '#64748b', maxWidth: '400px', margin: '8px auto 24px' }}>
                            Currently there are no live tracking sessions. Start a new trip or run a simulation to see them here.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                        {activeTrips.map(trip => renderTripCard(trip, true))}
                    </div>
                )}
            </div>

            {/* Recently Tracked Section - Table View */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f5f3ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlayArrowIcon style={{ color: '#6366f1', fontSize: 20 }} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Recently Tracked</h3>
                </div>

                {previousLiveTrips.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <p style={{ color: '#64748b', margin: 0 }}>No previous live tracking history found.</p>
                    </div>
                ) : (
                    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trip Name</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distance</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previousLiveTrips.map((trip) => (
                                        <tr 
                                            key={trip._id} 
                                            style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}
                                            className="hover:bg-slate-50"
                                            onClick={() => navigate(`/dashboard/trips/${trip._id}`)}
                                        >
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: 700, color: '#1e293b' }}>{trip.name}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>
                                                {new Date(trip.startTime).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#334155', fontSize: '14px', fontWeight: 600 }}>
                                                {(trip.totalDistance || 0).toFixed(2)} km
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#334155', fontSize: '14px', fontWeight: 600 }}>
                                                {formatDuration(calculateTripDuration(trip.startTime, trip.endTime))}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '11px', 
                                                    fontWeight: 800, 
                                                    background: trip.metadata?.source === 'simulation' ? '#f5f3ff' : '#eff6ff',
                                                    color: trip.metadata?.source === 'simulation' ? '#7c3aed' : '#2563eb'
                                                }}>
                                                    {trip.metadata?.source === 'simulation' ? 'SIMULATION' : 'MOBILE APP'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <button 
                                                    className="btn-secondary"
                                                    style={{ padding: '6px 16px', fontSize: '13px' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/dashboard/trips/${trip._id}`);
                                                    }}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse-green {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
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
                            <strong> Once you start tracking on your phone, the trip will appear in the active fleet list.</strong>
                        </Typography>

                        <Button 
                            variant="outlined" 
                            fullWidth 
                            onClick={() => setQrModalOpen(false)}
                            sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
                        >
                            Close
                        </Button>

                    </Box>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LiveTracking;

