import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../../../services/tripApi';
import { Trip } from '../../../types/trip.types';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
            onClick={() => navigate(`/dashboard/trips/${trip._id}`)}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>{trip.name}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                        {isLive ? `Started ${formatDate(trip.startTime)}` : `Tracked on ${new Date(trip.startTime).toLocaleDateString()}`}
                    </p>
                </div>
                <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: isLive ? '#ecfdf5' : '#f5f3ff', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    {isLive ? (
                        <GpsFixedIcon style={{ color: '#10b981', fontSize: 20, animation: 'pulse-green 2s infinite' }} />
                    ) : (
                        <PlayArrowIcon style={{ color: '#6366f1', fontSize: 20 }} />
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1, background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <p style={{ margin: 0, fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Device</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 700, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {trip.metadata?.deviceName || (trip.metadata?.source === 'simulation' ? 'System Engine' : 'Mobile Web')}
                    </p>
                </div>
                <div style={{ flex: 1, background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <p style={{ margin: 0, fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Mode</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                        {trip.metadata?.source === 'simulation' ? 'Simulation' : 'Live GPS'}
                    </p>
                </div>
            </div>

            <button
                className="btn-primary"
                style={{
                    width: '100%',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: 700,
                    background: isLive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    boxShadow: isLive ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(99, 102, 241, 0.2)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                {isLive ? <><GpsFixedIcon style={{ fontSize: 16 }} /> Monitor Live</> : <><PlayArrowIcon style={{ fontSize: 16 }} /> View Replay</>}
            </button>
        </div>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="live-tracking-container" style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Fleet Monitoring</h2>
                    <p style={{ color: '#64748b', fontSize: '16px', margin: '6px 0 0 0', fontWeight: 500 }}>Real-time telemetry and operational intelligence</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', padding: '6px 16px', borderRadius: '30px', border: '1px solid #d1fae5', marginBottom: '8px' }}>
                            <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', animation: 'pulse-green 2s infinite' }}></span>
                            <span style={{ color: '#065f46', fontSize: '12px', fontWeight: 800, letterSpacing: '0.02em' }}>NETWORK ACTIVE</span>
                        </div>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={handleStartLiveTracking}
                        style={{
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            padding: '14px 28px',
                            borderRadius: '16px',
                            fontWeight: 800,
                            fontSize: '15px',
                            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <GpsFixedIcon style={{ fontSize: 20 }} /> Start New Tracking
                    </button>
                </div>
            </div>

            {/* Active Fleet Section */}
            <div style={{ marginBottom: '56px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                        <GpsFixedIcon style={{ color: '#10b981', fontSize: 24 }} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>Active Fleet</h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{activeTrips.length} vehicles currently transmitting</p>
                    </div>
                </div>

                {activeTrips.length === 0 ? (
                    <div className="dashboard-card" style={{ 
                        textAlign: 'center', 
                        padding: '80px 20px', 
                        background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)', 
                        border: '2px dashed #e2e8f0',
                        borderRadius: '24px'
                    }}>
                        <div style={{ 
                            display: 'inline-flex', 
                            padding: '32px', 
                            background: 'white', 
                            borderRadius: '24px', 
                            marginBottom: '24px', 
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                            border: '1px solid #f1f5f9'
                        }}>
                            <DirectionsCarIcon style={{ fontSize: 48, color: '#cbd5e1' }} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#334155' }}>Radar Clear</h3>
                        <p style={{ color: '#64748b', maxWidth: '400px', margin: '12px auto 32px', fontSize: '15px', lineHeight: 1.6 }}>
                            There are no active tracking sessions at the moment. Scan the QR code to link a mobile device or initiate a system simulation.
                        </p>
                        <button 
                            onClick={handleStartLiveTracking}
                            style={{ 
                                background: 'white', 
                                border: '1px solid #e2e8f0', 
                                padding: '10px 24px', 
                                borderRadius: '12px', 
                                fontWeight: 700, 
                                color: '#475569',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                            Get Started
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {activeTrips.map(trip => renderTripCard(trip, true))}
                    </div>
                )}
            </div>

            {/* Recently Tracked Section - Table View */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                        <PlayArrowIcon style={{ color: '#6366f1', fontSize: 24 }} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>Operations History</h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Logs from the last 10 sessions</p>
                    </div>
                </div>

                {previousLiveTrips.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', background: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <p style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>No historical data available for this view.</p>
                    </div>
                ) : (
                    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                        <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Trip / Device</th>
                                        <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date</th>
                                        <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Metrics</th>
                                        <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Source</th>
                                        <th style={{ padding: '18px 24px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Action</th>
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
                                            <td style={{ padding: '18px 24px' }}>
                                                <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '15px' }}>{trip.name}</div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', fontWeight: 600 }}>{trip.metadata?.deviceName || 'Standard Device'}</div>
                                            </td>
                                            <td style={{ padding: '18px 24px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                                                {new Date(trip.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '18px 24px' }}>
                                                <div style={{ color: '#334155', fontSize: '14px', fontWeight: 700 }}>{(trip.totalDistance || 0).toFixed(2)} km</div>
                                                <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 500 }}>{formatDuration(calculateTripDuration(trip.startTime, trip.endTime))}</div>
                                            </td>
                                            <td style={{ padding: '18px 24px' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '10px',
                                                    fontWeight: 900,
                                                    letterSpacing: '0.02em',
                                                    background: trip.metadata?.source === 'simulation' ? '#f5f3ff' : '#eff6ff',
                                                    color: trip.metadata?.source === 'simulation' ? '#7c3aed' : '#2563eb',
                                                    border: `1px solid ${trip.metadata?.source === 'simulation' ? '#ddd6fe' : '#dbeafe'}`
                                                }}>
                                                    {trip.metadata?.source === 'simulation' ? 'SIMULATION' : 'LIVE FEED'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                                <button
                                                    style={{ 
                                                        padding: '8px 16px', 
                                                        fontSize: '13px', 
                                                        fontWeight: 700, 
                                                        borderRadius: '10px', 
                                                        background: 'white', 
                                                        border: '1px solid #e2e8f0', 
                                                        color: '#475569',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/dashboard/trips/${trip._id}`);
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#1e293b'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                                                >
                                                    Analysis
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
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* QR Code Handshake Modal */}
            <Dialog
                open={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 6, p: 1, maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.02em', color: '#0f172a' }}>Connect Mobile</Typography>
                    <IconButton onClick={() => setQrModalOpen(false)} sx={{ bgcolor: '#f8fafc' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Box sx={{
                            p: 3,
                            bgcolor: 'white',
                            borderRadius: 6,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                            mb: 4,
                            border: '1px solid #f1f5f9'
                        }}>
                            <QRCodeSVG value={trackingUrl} size={280} level="H" includeMargin />
                        </Box>
                        
                        <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #d1fae5', marginBottom: '24px', textAlign: 'left', width: '100%' }}>
                            <Typography variant="body2" color="#065f46" fontWeight="800" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon sx={{ fontSize: 18 }} /> LINK ONCE, USE FOREVER
                            </Typography>
                            <Typography variant="caption" color="#065f46" sx={{ lineHeight: 1.5, display: 'block' }}>
                                Scan this QR with your phone to link it as a tracking device. Your phone will <strong>memorize</strong> this connection, allowing you to start future trips with a single click without scanning again.
                            </Typography>
                        </div>

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => setQrModalOpen(false)}
                            sx={{ 
                                borderRadius: 4, 
                                py: 2, 
                                fontWeight: '900', 
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                textTransform: 'none',
                                fontSize: '16px'
                            }}
                        >
                            Got it, I'm scanning
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LiveTracking;

