import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../../../services/tripApi';
import { Trip } from '../../../types/trip.types';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import SensorsIcon from '@mui/icons-material/Sensors';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
    Dialog,
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
        const interval = setInterval(loadTrips, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadTrips = async () => {
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
            ).slice(0, 5); // Reduced to 5 for cleanliness

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

    const renderTripCard = (trip: Trip) => (
        <div
            key={trip._id}
            className="clean-trip-card"
            onClick={() => navigate(`/dashboard/trips/${trip._id}`)}
        >
            <div className="card-top">
                <div className="trip-info">
                    <span className="live-pill">LIVE</span>
                    <h4 className="trip-name">{trip.name}</h4>
                    <p className="device-name">{trip.metadata?.deviceName || 'Primary Device'}</p>
                </div>
                <div className="trip-icon">
                    <DirectionsCarIcon sx={{ fontSize: 20, color: '#94a3b8' }} />
                </div>
            </div>
            
            <div className="card-details">
                <div className="detail-item">
                    <span className="label">Started</span>
                    <span className="value">{new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="detail-item">
                    <span className="label">Mode</span>
                    <span className="value">{trip.metadata?.source === 'simulation' ? 'Simulation' : 'Live GPS'}</span>
                </div>
            </div>

            <div className="card-action">
                <span>View Real-time Feed</span>
                <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="loading-state">
                <div className="minimal-spinner"></div>
            </div>
        );
    }

    return (
        <div className="live-tracking-minimal">
            {/* Header */}
            <header className="minimal-header">
                <div className="title-section">
                    <h1>Live Tracking</h1>
                    <p>Monitor your fleet's active sessions in real-time.</p>
                </div>
                <button className="minimal-btn-primary" onClick={handleStartLiveTracking}>
                    <GpsFixedIcon sx={{ fontSize: 18 }} />
                    <span>Start New Session</span>
                </button>
            </header>

            <main className="minimal-content">
                {/* Active Section */}
                <section className="minimal-section">
                    <div className="section-title-bar">
                        <h2>Active Vehicles</h2>
                        <span className="count-badge">{activeTrips.length}</span>
                    </div>

                    {activeTrips.length === 0 ? (
                        <div className="minimal-empty-state">
                            <div className="empty-icon-box">
                                <SensorsIcon sx={{ fontSize: 32, color: '#e2e8f0' }} />
                            </div>
                            <p>No active sessions found. Start tracking to see live data.</p>
                            <button className="text-btn" onClick={handleStartLiveTracking}>Initiate Tracking</button>
                        </div>
                    ) : (
                        <div className="minimal-grid">
                            {activeTrips.map(trip => renderTripCard(trip))}
                        </div>
                    )}
                </section>

                {/* History Section - Very Subtle */}
                {previousLiveTrips.length > 0 && (
                    <section className="minimal-section history">
                        <div className="section-title-bar">
                            <h2>Recent Activity</h2>
                        </div>
                        <div className="minimal-list">
                            {previousLiveTrips.map((trip) => (
                                <div key={trip._id} className="list-item" onClick={() => navigate(`/dashboard/trips/${trip._id}`)}>
                                    <div className="item-main">
                                        <div className="item-icon">
                                            <HistoryIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                                        </div>
                                        <div className="item-text">
                                            <span className="item-title">{trip.name}</span>
                                            <span className="item-subtitle">{trip.metadata?.deviceName || 'Mobile'} • {new Date(trip.startTime).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="item-meta">
                                        <span className="item-stat">{(trip.totalDistance || 0).toFixed(1)} km</span>
                                        <ArrowForwardIosIcon sx={{ fontSize: 12, color: '#cbd5e1' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Clean QR Modal */}
            <Dialog
                open={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                PaperProps={{
                    sx: { 
                        borderRadius: '20px', 
                        maxWidth: '400px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        border: '1px solid #f1f5f9'
                    }
                }}
            >
                <div className="minimal-modal">
                    <div className="modal-top">
                        <h3>Link Device</h3>
                        <IconButton onClick={() => setQrModalOpen(false)} size="small">
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </div>
                    <div className="modal-body">
                        <div className="qr-container-minimal">
                            <QRCodeSVG value={trackingUrl} size={200} level="M" />
                        </div>
                        <p className="modal-hint">Scan this code with your mobile device to start a live tracking session.</p>
                        <button className="minimal-btn-secondary" onClick={() => setQrModalOpen(false)}>Done</button>
                    </div>
                </div>
            </Dialog>

            <style>{`
                .live-tracking-minimal {
                    padding: 40px;
                    max-width: 1100px;
                    margin: 0 auto;
                    color: #1e293b;
                }

                /* Header */
                .minimal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 64px;
                }

                .minimal-header h1 {
                    font-size: 32px;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                    letter-spacing: -0.02em;
                }

                .minimal-header p {
                    color: #64748b;
                    margin: 0;
                    font-size: 15px;
                }

                .minimal-btn-primary {
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .minimal-btn-primary:hover {
                    background: #1e293b;
                }

                /* Sections */
                .minimal-section {
                    margin-bottom: 56px;
                }

                .section-title-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .section-title-bar h2 {
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0;
                    color: #475569;
                }

                .count-badge {
                    background: #f1f5f9;
                    color: #64748b;
                    font-size: 12px;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 6px;
                }

                /* Grid Cards */
                .minimal-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 24px;
                }

                .clean-trip-card {
                    background: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 16px;
                    padding: 24px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .clean-trip-card:hover {
                    border-color: #e2e8f0;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    transform: translateY(-2px);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }

                .live-pill {
                    display: inline-block;
                    font-size: 10px;
                    font-weight: 800;
                    color: #10b981;
                    background: #ecfdf5;
                    padding: 2px 8px;
                    border-radius: 100px;
                    margin-bottom: 8px;
                }

                .trip-name {
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0;
                }

                .device-name {
                    font-size: 13px;
                    color: #94a3b8;
                    margin: 4px 0 0 0;
                }

                .card-details {
                    display: flex;
                    gap: 24px;
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #f8fafc;
                }

                .detail-item {
                    display: flex;
                    flex-direction: column;
                }

                .detail-item .label {
                    font-size: 11px;
                    color: #94a3b8;
                    text-transform: uppercase;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                }

                .detail-item .value {
                    font-size: 14px;
                    font-weight: 600;
                    color: #475569;
                }

                .card-action {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 13px;
                    font-weight: 600;
                    color: #6366f1;
                }

                /* Empty State */
                .minimal-empty-state {
                    text-align: center;
                    padding: 64px 24px;
                    background: #fbfcfd;
                    border: 1px dashed #e2e8f0;
                    border-radius: 20px;
                }

                .empty-icon-box {
                    margin-bottom: 16px;
                }

                .minimal-empty-state p {
                    color: #94a3b8;
                    font-size: 14px;
                    margin-bottom: 20px;
                }

                .text-btn {
                    background: none;
                    border: none;
                    color: #6366f1;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    text-decoration: underline;
                }

                /* History List */
                .minimal-list {
                    background: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 16px;
                    overflow: hidden;
                }

                .list-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    cursor: pointer;
                    transition: background 0.2s;
                    border-bottom: 1px solid #f8fafc;
                }

                .list-item:last-child {
                    border-bottom: none;
                }

                .list-item:hover {
                    background: #fbfcfd;
                }

                .item-main {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .item-icon {
                    width: 36px;
                    height: 36px;
                    background: #f8fafc;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .item-text {
                    display: flex;
                    flex-direction: column;
                }

                .item-title {
                    font-size: 15px;
                    font-weight: 600;
                }

                .item-subtitle {
                    font-size: 12px;
                    color: #94a3b8;
                }

                .item-meta {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .item-stat {
                    font-size: 14px;
                    font-weight: 700;
                    color: #475569;
                }

                /* Modal */
                .minimal-modal {
                    padding: 32px;
                }

                .modal-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .modal-top h3 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 700;
                }

                .modal-body {
                    text-align: center;
                }

                .qr-container-minimal {
                    padding: 16px;
                    background: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 16px;
                    display: inline-block;
                    margin-bottom: 24px;
                }

                .modal-hint {
                    font-size: 14px;
                    color: #64748b;
                    line-height: 1.5;
                    margin-bottom: 32px;
                }

                .minimal-btn-secondary {
                    width: 100%;
                    padding: 12px;
                    background: #f1f5f9;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    color: #475569;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .minimal-btn-secondary:hover {
                    background: #e2e8f0;
                }

                /* Loading */
                .loading-state {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 60vh;
                }

                .minimal-spinner {
                    width: 32px;
                    height: 32px;
                    border: 2px solid #f1f5f9;
                    border-top: 2px solid #6366f1;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LiveTracking;

