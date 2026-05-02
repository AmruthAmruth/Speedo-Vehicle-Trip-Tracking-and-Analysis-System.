import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi } from '../../../services/tripApi';
import { Trip, GPSPoint } from '../../../types/trip.types';
import { formatDistance, formatDuration, calculateTripDuration, formatDate, formatSpeed } from '../../../utils/tripUtils';
import TripMap from '../components/TripMap';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RouteIcon from '@mui/icons-material/Route';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SpeedIcon from '@mui/icons-material/Speed';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { socketService } from '../../../services/socketService';
import { getDistance } from 'geolib';
import { detectOverspeedSections, detectIdlingPoints } from '../../../utils/mapUtils';
import { toast } from 'react-toastify';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SecurityIcon from '@mui/icons-material/Security';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const TripDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [speedLimit, setSpeedLimit] = useState(80);
    const [showStoppages, setShowStoppages] = useState(true);
    const [showIdling, setShowIdling] = useState(true);
    const [isSimulating, setIsSimulating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Playback/Replay States
    const [replayIndex, setReplayIndex] = useState<number | null>(null);
    const [isReplaying, setIsReplaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    useEffect(() => {
        if (id) {
            loadTripData();

            // Initialize Real-Time Socket Connection
            const socket = socketService.connect();
            socketService.joinTrip(id);

            const handleLocationUpdate = (newPoint: GPSPoint) => {
                console.log('📍 Real-time point received:', newPoint);
                setGpsPoints(prev => {
                    if (prev.some(p => p._id === newPoint._id)) return prev;
                    const next = [...prev, newPoint];
                    // If the user hasn't manually scrubbed (or was at the end), keep them at the end
                    setReplayIndex(currentIndex => {
                        if (currentIndex === null || currentIndex === prev.length - 1) {
                            return next.length - 1;
                        }
                        return currentIndex;
                    });
                    return next;
                });
            };

            socket.on('locationUpdate', handleLocationUpdate);

            return () => {
                socket.off('locationUpdate', handleLocationUpdate);
                socketService.disconnect();
            };
        }
    }, [id]);

    const loadTripData = async () => {
        try {
            const [tripData, gpsData] = await Promise.all([
                tripApi.getTripById(id!),
                tripApi.getTripGPSPoints(id!),
            ]);
            setTrip(tripData);
            setGpsPoints(gpsData.gpsPoints);
            // Initialize replay index to the end if not replaying
            if (gpsData.gpsPoints.length > 0) {
                setReplayIndex(gpsData.gpsPoints.length - 1);
            }
        } catch (error) {
            console.error('Failed to load trip data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Playback Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isReplaying && replayIndex !== null && replayIndex < gpsPoints.length - 1) {
            interval = setInterval(() => {
                setReplayIndex(prev => {
                    if (prev !== null && prev < gpsPoints.length - 1) {
                        return prev + 1;
                    }
                    setIsReplaying(false);
                    return prev;
                });
            }, 1000 / playbackSpeed);
        } else if (replayIndex === gpsPoints.length - 1) {
            setIsReplaying(false);
        }
        return () => clearInterval(interval);
    }, [isReplaying, replayIndex, playbackSpeed, gpsPoints.length]);

    const handleStartSimulation = async () => {
        try {
            setIsSimulating(true);
            // Clear existing points so we can watch them be added live
            setGpsPoints([]);
            setReplayIndex(null);
            await tripApi.startSimulation(id!);
            toast.info('Simulation started');
            console.log('🚀 Simulation started');
        } catch (error) {
            console.error('Failed to start simulation:', error);
            toast.error('Failed to start simulation');
            setIsSimulating(false);
        }
    };

    const handleStopSimulation = async () => {
        try {
            await tripApi.stopSimulation(id!);
            toast.info('Simulation stopped');
            setIsSimulating(false);
            setLoading(true);
            await loadTripData(); // Reload full trip to show the whole path
            console.log('🛑 Simulation stopped');
        } catch (error) {
            console.error('Failed to stop simulation:', error);
            toast.error('Failed to stop simulation');
        }
    };

    const handleDeleteTrip = async () => {
        if (window.confirm('Are you sure you want to delete this trip and all its GPS data? This action cannot be undone.')) {
            try {
                setLoading(true);
                await tripApi.deleteTrip(id!);
                toast.success('Trip deleted successfully');
                navigate('/dashboard/trips');
            } catch (error) {
                console.error('Failed to delete trip:', error);
                toast.error('Failed to delete trip');
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="dashboard-card">
                <div className="empty-state">
                    <div className="empty-icon">❌</div>
                    <h4 className="empty-title">Trip not found</h4>
                    <p className="empty-description">The trip you're looking for doesn't exist</p>
                    <button className="btn-primary" onClick={() => navigate('/dashboard/trips')}>
                        Back to Trips
                    </button>
                </div>
            </div>
        );
    }

    const calculateLiveStats = () => {
        // Use visible points based on replay/simulation state
        const activePoints = (isSimulating || isReplaying) && replayIndex !== null 
            ? gpsPoints.slice(0, replayIndex + 1)
            : gpsPoints;

        if (activePoints.length === 0) return { 
            distance: 0, 
            avgSpeed: 0, 
            maxSpeed: 0, 
            idling: 0, 
            stoppage: 0,
            duration: 0
        };

        let distance = 0;
        let idling = 0;
        let stoppage = 0;
        let maxSpeed = 0;

        for (let i = 1; i < activePoints.length; i++) {
            const prev = activePoints[i - 1];
            const curr = activePoints[i];

            const d = getDistance(
                { latitude: prev.latitude, longitude: prev.longitude },
                { latitude: curr.latitude, longitude: curr.longitude }
            );
            distance += d;

            const timeDiff = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000;
            if (timeDiff > 0) {
                if (curr.speed > maxSpeed) maxSpeed = curr.speed;
                
                if (prev.ignition && curr.ignition && curr.speed < 1) {
                    idling += timeDiff;
                } else if (!prev.ignition && !curr.ignition) {
                    stoppage += timeDiff;
                }
            }
        }

        const duration = activePoints.length > 1 ? calculateTripDuration(
            activePoints[0].timestamp, 
            activePoints[activePoints.length - 1].timestamp
        ) : 0;
        
        const avgSpeed = duration > 0 ? (distance / 1000) / (duration / 3600) : 0;

        return { 
            distance, 
            avgSpeed, 
            maxSpeed, 
            idling, 
            stoppage,
            duration
        };
    };

    const calculateDriverScore = () => {
        // Use visible points based on replay/simulation state
        const activePoints = (isSimulating || isReplaying) && replayIndex !== null 
            ? gpsPoints.slice(0, replayIndex + 1)
            : gpsPoints;

        // Require at least 2 points for a meaningful score
        if (activePoints.length < 2) return { 
            score: 100, 
            breakdown: { overspeed: 0, idling: 0, harshBraking: 0, harshBrakingCount: 0 }, 
            isPlaceholder: true 
        };

        let overspeedPenalty = 0;
        let idlingPenalty = 0;
        let harshBrakingPenalty = 0;
        let harshBrakingCount = 0;

        // 1. Overspeed Penalty
        const overspeedSections = detectOverspeedSections(activePoints, speedLimit);
        overspeedPenalty = overspeedSections.length * 5;

        // 2. Idling Penalty
        const idlingPoints = detectIdlingPoints(activePoints);
        const totalIdlingSeconds = idlingPoints.reduce((acc, curr) => acc + curr.duration, 0);
        idlingPenalty = Math.floor(totalIdlingSeconds / 300) * 2;

        // 3. Harsh Braking Detection (Simulated)
        for (let i = 1; i < activePoints.length; i++) {
            const prev = activePoints[i - 1];
            const curr = activePoints[i];
            
            const timeDiff = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000;
            // Safety: Only check points with a reasonable time gap (at least 0.5s)
            if (timeDiff >= 0.5 && timeDiff < 10) {
                const speedDiff = prev.speed - curr.speed;
                // Only count deceleration (slowing down)
                if (speedDiff > 0) {
                    const deceleration = (speedDiff * 0.277778) / timeDiff; // m/s^2
                    
                    if (deceleration > 3.0 && deceleration < 20.0) { // Safety: ignore impossible deceleration (>20m/s^2)
                        harshBrakingCount++;
                    }
                }
            }
        }
        harshBrakingPenalty = harshBrakingCount * 4;

        const totalPenalty = overspeedPenalty + idlingPenalty + harshBrakingPenalty;
        const score = Math.max(0, 100 - totalPenalty);

        return {
            score,
            breakdown: {
                overspeed: overspeedPenalty,
                idling: idlingPenalty,
                harshBraking: harshBrakingPenalty,
                harshBrakingCount
            },
            isPlaceholder: false
        };
    };

    const stats = calculateLiveStats();
    const driverInsight = calculateDriverScore();

    return (
        <div className="trip-details">
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <button className="btn-secondary" onClick={() => navigate('/dashboard/trips')}>
                        <ArrowBackIcon style={{ fontSize: 18 }} />
                        Back to Trips
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {!isSimulating ? (
                            <button
                                className="btn-primary"
                                onClick={handleStartSimulation}
                                style={{
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                🚀 Simulate Live Trip
                            </button>
                        ) : (
                            <button
                                className="btn-primary"
                                onClick={handleStopSimulation}
                                style={{
                                    background: '#EF4444',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                🛑 Stop Simulation
                            </button>
                        )}
                        {trip.isActive && (
                            <button
                                className="btn-primary"
                                onClick={async () => {
                                    if (window.confirm('Are you sure you want to end this live trip?')) {
                                        try {
                                            await tripApi.stopLiveTrip(id!);
                                            loadTripData();
                                        } catch (error) {
                                            console.error('Failed to stop live trip:', error);
                                        }
                                    }
                                }}
                                style={{
                                    background: '#EF4444',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                ⏹️ End Live Trip
                            </button>
                        )}
                        <button
                            className="btn-primary"
                            onClick={handleDeleteTrip}
                            style={{
                                background: '#E53E3E',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            🗑️ Delete Trip
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 8px 0' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#2d3748', margin: 0 }}>
                        {trip.name}
                    </h2>
                    {trip.isActive && (
                        <span style={{
                            background: '#EF4444',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)',
                            animation: 'pulse-live 2s infinite'
                        }}>
                            <span style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%' }}></span>
                            LIVE
                        </span>
                    )}
                </div>
                <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
                    {formatDate(trip.startTime)} {trip.isActive ? '- Ongoing' : `- ${formatDate(trip.endTime)}`}
                </p>
                <style>{`
                    @keyframes pulse-live {
                        0% { opacity: 1; }
                        50% { opacity: 0.6; }
                        100% { opacity: 1; }
                    }
                `}</style>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card">
                    <div className="stat-icon">
                        <RouteIcon style={{ fontSize: 28 }} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Distance</p>
                        <h3 className="stat-value">{formatDistance(stats.distance)}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <AccessTimeIcon style={{ fontSize: 28 }} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Duration</p>
                        <h3 className="stat-value">{formatDuration(stats.duration)}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <SpeedIcon style={{ fontSize: 28 }} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Avg Speed</p>
                        <h3 className="stat-value">{formatSpeed(stats.avgSpeed)}</h3>
                        <p style={{ fontSize: '12px', color: '#718096', margin: '4px 0 0 0' }}>
                            Max: {formatSpeed(stats.maxSpeed)}
                        </p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                        <PauseCircleIcon style={{ fontSize: 28 }} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Idling Time</p>
                        <h3 className="stat-value">{formatDuration(stats.idling)}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }}>
                        <StopCircleIcon style={{ fontSize: 28 }} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Stoppage Time</p>
                        <h3 className="stat-value">{formatDuration(stats.stoppage)}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                        <LocationOnIcon style={{ fontSize: 28 }} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">GPS Points</p>
                        <h3 className="stat-value">{gpsPoints.length}</h3>
                    </div>
                </div>
            </div>

            {/* Driver Intelligence Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
                {/* Score Card */}
                <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '20px' }}>
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="#EDF2F7" strokeWidth="12" />
                            <circle 
                                cx="80" 
                                cy="80" 
                                r="70" 
                                fill="none" 
                                stroke={driverInsight.score > 80 ? '#10B981' : driverInsight.score > 50 ? '#F59E0B' : '#EF4444'} 
                                strokeWidth="12" 
                                strokeDasharray={2 * Math.PI * 70} 
                                strokeDashoffset={2 * Math.PI * 70 * (1 - driverInsight.score / 100)} 
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 1s ease-out', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <h2 style={{ fontSize: '36px', fontWeight: 800, margin: 0, color: '#2D3748' }}>
                                {driverInsight.isPlaceholder ? '--' : driverInsight.score}
                            </h2>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: '#718096', margin: 0, textTransform: 'uppercase' }}>Score</p>
                        </div>
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#2D3748', marginBottom: '8px' }}>
                        {driverInsight.isPlaceholder ? 'Awaiting Data...' : (driverInsight.score > 80 ? 'Excellent Driver' : driverInsight.score > 60 ? 'Good Driver' : 'Risk Detected')}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
                        {isSimulating || isReplaying ? 'Real-time performance audit' : 'Overall trip behavioral average'}
                    </p>
                </div>

                {/* Breakdown Card */}
                <div className="dashboard-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <SecurityIcon style={{ color: '#4F46E5' }} />
                            Behavioral Breakdown
                        </h3>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#6366F1', background: '#EEF2FF', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                            {isSimulating || isReplaying ? 'Live Tracking' : 'Trip Average'}
                        </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#4A5568', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <SpeedIcon style={{ fontSize: 18, color: '#EF4444' }} /> Overspeeding
                                </span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#EF4444' }}>-{driverInsight.breakdown.overspeed} pts</span>
                            </div>
                            <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px' }}>
                                <div style={{ height: '100%', width: `${Math.min(driverInsight.breakdown.overspeed * 2, 100)}%`, background: '#EF4444', borderRadius: '3px' }} />
                            </div>
                        </div>

                        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#4A5568', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <PauseCircleIcon style={{ fontSize: 18, color: '#F59E0B' }} /> Excessive Idling
                                </span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#F59E0B' }}>-{driverInsight.breakdown.idling} pts</span>
                            </div>
                            <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px' }}>
                                <div style={{ height: '100%', width: `${Math.min(driverInsight.breakdown.idling * 5, 100)}%`, background: '#F59E0B', borderRadius: '3px' }} />
                            </div>
                        </div>

                        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#4A5568', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <TrendingDownIcon style={{ fontSize: 18, color: '#6366F1' }} /> Harsh Braking
                                </span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#6366F1' }}>-{driverInsight.breakdown.harshBraking} pts</span>
                            </div>
                            <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px' }}>
                                <div style={{ height: '100%', width: `${Math.min(driverInsight.breakdown.harshBraking * 4, 100)}%`, background: '#6366F1', borderRadius: '3px' }} />
                            </div>
                            <p style={{ fontSize: '11px', color: '#718096', marginTop: '6px' }}>Detected {driverInsight.breakdown.harshBrakingCount} events</p>
                        </div>

                        <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: '12px', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <WarningAmberIcon style={{ color: '#10B981' }} />
                            <div>
                                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#065F46', margin: 0 }}>Safety Status</h4>
                                <p style={{ fontSize: '12px', color: '#047857', margin: 0 }}>
                                    {driverInsight.score > 80 ? 'Minimal risk profile' : 'Improvement recommended'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Visualization */}
            <div className="dashboard-card" style={{ marginBottom: '24px' }}>
                <div className="card-header" style={{ marginBottom: '16px' }}>
                    <div>
                        <h3 className="card-title">Trip Route</h3>
                        <p className="card-subtitle">Interactive map with overspeed, stoppages, and idling detection</p>
                    </div>
                </div>

                {/* Map Controls */}
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label htmlFor="speedLimit" style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563' }}>
                            Speed Limit:
                        </label>
                        <input
                            type="number"
                            id="speedLimit"
                            value={speedLimit}
                            onChange={(e) => setSpeedLimit(Number(e.target.value))}
                            min="20"
                            max="200"
                            step="10"
                            style={{
                                width: '80px',
                                padding: '6px 10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 600
                            }}
                        />
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>km/h</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showStoppages}
                                onChange={(e) => setShowStoppages(e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '14px', color: '#4b5563' }}>Show Stoppages</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showIdling}
                                onChange={(e) => setShowIdling(e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '14px', color: '#4b5563' }}>Show Idling</span>
                        </label>
                    </div>
                </div>

                {/* Map Component */}
                <div style={{ position: 'relative' }}>
                    <TripMap
                        gpsPoints={gpsPoints}
                        tripName={trip.name}
                        speedLimit={speedLimit}
                        showStoppages={showStoppages}
                        showIdling={showIdling}
                        activePointIndex={replayIndex !== null ? replayIndex : undefined}
                    />

                    {/* Playback Controls Overlay */}
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '90%',
                        maxWidth: '800px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)',
                        padding: '16px 24px',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button
                                onClick={() => setIsReplaying(!isReplaying)}
                                style={{
                                    background: isReplaying ? '#FEE2E2' : '#E0E7FF',
                                    color: isReplaying ? '#EF4444' : '#4F46E5',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                            >
                                {isReplaying ? 
                                    <PauseCircleIcon style={{ fontSize: 24 }} /> : 
                                    <RouteIcon style={{ fontSize: 24, transform: 'rotate(90deg)' }} /> 
                                }
                            </button>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: '4px' }}>
                                            {replayIndex !== null && gpsPoints[replayIndex] ? 
                                                new Date(gpsPoints[replayIndex].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 
                                                '--:--:--'
                                            }
                                        </span>
                                        {replayIndex !== null && gpsPoints[replayIndex] && (
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: gpsPoints[replayIndex].speed > speedLimit ? '#EF4444' : '#10B981' }}>
                                                {formatSpeed(gpsPoints[replayIndex].speed)}
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                                        Point {replayIndex !== null ? replayIndex + 1 : 0} of {gpsPoints.length}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={gpsPoints.length > 0 ? gpsPoints.length - 1 : 0}
                                    value={replayIndex || 0}
                                    onChange={(e) => {
                                        setReplayIndex(parseInt(e.target.value));
                                        if (isReplaying) setIsReplaying(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        cursor: 'pointer',
                                        accentColor: '#4F46E5',
                                        height: '6px',
                                        borderRadius: '3px'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Speed</span>
                                <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '8px', gap: '2px' }}>
                                    {[1, 2, 5].map(speed => (
                                        <button
                                            key={speed}
                                            onClick={() => setPlaybackSpeed(speed)}
                                            style={{
                                                padding: '4px 10px',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                background: playbackSpeed === speed ? '#4F46E5' : 'transparent',
                                                color: playbackSpeed === speed ? 'white' : '#64748B',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* GPS Points Table */}
            <div className="dashboard-card">
                <div className="card-header">
                    <h3 className="card-title">GPS Points</h3>
                    <p className="card-subtitle">{gpsPoints.length} points recorded</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#718096', fontWeight: 600 }}>#</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#718096', fontWeight: 600 }}>Timestamp</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#718096', fontWeight: 600 }}>Latitude</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#718096', fontWeight: 600 }}>Longitude</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#718096', fontWeight: 600 }}>Speed</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#718096', fontWeight: 600 }}>Ignition</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gpsPoints
                                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                .map((point, index) => (
                                    <tr
                                        key={point._id}
                                        style={{
                                            borderBottom: '1px solid #f1f5f9',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                        <td style={{ padding: '12px', color: '#94a3b8', fontSize: '13px' }}>
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td style={{ padding: '12px', color: '#2d3748', fontSize: '13px' }}>
                                            {new Date(point.timestamp).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '12px', color: '#718096', fontFamily: 'monospace' }}>
                                            {point.latitude.toFixed(6)}
                                        </td>
                                        <td style={{ padding: '12px', color: '#718096', fontFamily: 'monospace' }}>
                                            {point.longitude.toFixed(6)}
                                        </td>
                                        <td style={{ padding: '12px', color: '#2d3748' }}>
                                            {formatSpeed(point.speed)}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    background: point.ignition ? '#d1fae5' : '#fee2e2',
                                                    color: point.ignition ? '#065f46' : '#991b1b',
                                                }}
                                            >
                                                {point.ignition ? 'ON' : 'OFF'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Control */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderTop: '1px solid #f1f5f9',
                    background: '#ffffff',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                            Showing <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                {gpsPoints.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
                                {Math.min(gpsPoints.length, currentPage * itemsPerPage)}
                            </span> of <span style={{ fontWeight: 600, color: '#1e293b' }}>{gpsPoints.length}</span> points
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>Rows per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '13px',
                                    color: '#475569',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: currentPage === 1 ? '#f8fafc' : '#ffffff',
                                color: currentPage === 1 ? '#cbd5e1' : '#475569',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: currentPage === 1 ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                                if (currentPage !== 1) {
                                    e.currentTarget.style.borderColor = '#6366f1';
                                    e.currentTarget.style.color = '#6366f1';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentPage !== 1) {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.color = '#475569';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            Previous
                        </button>

                        <div style={{ display: 'flex', gap: '6px' }}>
                            {/* Simple dynamic pagination numbers */}
                            {Array.from({ length: Math.ceil(gpsPoints.length / itemsPerPage) }, (_, i) => {
                                const pageNum = i + 1;
                                const totalPages = Math.ceil(gpsPoints.length / itemsPerPage);

                                // Show first, last, and pages around current
                                if (
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            style={{
                                                width: '38px',
                                                height: '38px',
                                                borderRadius: '8px',
                                                border: '1px solid',
                                                borderColor: currentPage === pageNum ? '#6366f1' : '#e2e8f0',
                                                background: currentPage === pageNum ? '#6366f1' : '#ffffff',
                                                color: currentPage === pageNum ? '#ffffff' : '#475569',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxShadow: currentPage === pageNum ? '0 4px 6px -1px rgba(99, 102, 241, 0.4)' : 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (currentPage !== pageNum) {
                                                    e.currentTarget.style.borderColor = '#6366f1';
                                                    e.currentTarget.style.color = '#6366f1';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (currentPage !== pageNum) {
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                    e.currentTarget.style.color = '#475569';
                                                }
                                            }}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }

                                if (
                                    (pageNum === 2 && currentPage > 3) ||
                                    (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                                ) {
                                    return <span key={pageNum} style={{ color: '#94a3b8', padding: '0 4px', alignSelf: 'center' }}>...</span>;
                                }

                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(gpsPoints.length / itemsPerPage), prev + 1))}
                            disabled={currentPage >= Math.ceil(gpsPoints.length / itemsPerPage) || gpsPoints.length === 0}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: (currentPage >= Math.ceil(gpsPoints.length / itemsPerPage) || gpsPoints.length === 0) ? '#f8fafc' : '#ffffff',
                                color: (currentPage >= Math.ceil(gpsPoints.length / itemsPerPage) || gpsPoints.length === 0) ? '#cbd5e1' : '#475569',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: (currentPage >= Math.ceil(gpsPoints.length / itemsPerPage) || gpsPoints.length === 0) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: (currentPage >= Math.ceil(gpsPoints.length / itemsPerPage) || gpsPoints.length === 0) ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                                if (currentPage < Math.ceil(gpsPoints.length / itemsPerPage)) {
                                    e.currentTarget.style.borderColor = '#6366f1';
                                    e.currentTarget.style.color = '#6366f1';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentPage < Math.ceil(gpsPoints.length / itemsPerPage)) {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.color = '#475569';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripDetails;
