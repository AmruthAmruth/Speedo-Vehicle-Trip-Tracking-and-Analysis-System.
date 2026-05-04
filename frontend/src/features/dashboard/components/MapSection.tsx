import React from 'react';
import TripMap from './TripMap';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import RouteIcon from '@mui/icons-material/Route';
import { GPSPoint } from '../../../types/trip.types';
import { formatSpeed } from '../../../utils/tripUtils';

interface MapSectionProps {
    gpsPoints: GPSPoint[];
    tripName: string;
    speedLimit: number;
    setSpeedLimit: (limit: number) => void;
    showStoppages: boolean;
    setShowStoppages: (show: boolean) => void;
    showIdling: boolean;
    setShowIdling: (show: boolean) => void;
    replayIndex: number | null;
    setReplayIndex: (index: number) => void;
    isReplaying: boolean;
    setIsReplaying: (isReplaying: boolean) => void;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
}

const MapSection: React.FC<MapSectionProps> = ({
    gpsPoints,
    tripName,
    speedLimit,
    setSpeedLimit,
    showStoppages,
    setShowStoppages,
    showIdling,
    setShowIdling,
    replayIndex,
    setReplayIndex,
    isReplaying,
    setIsReplaying,
    playbackSpeed,
    setPlaybackSpeed
}) => {
    return (
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
                    tripName={tripName}
                    speedLimit={speedLimit}
                    showStoppages={showStoppages}
                    showIdling={showIdling}
                    activePointIndex={replayIndex !== null ? replayIndex : undefined}
                />

                {/* Playback Controls Overlay - Glassmorphic & Modern */}
                <div style={{
                    position: 'absolute',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'calc(100% - 60px)',
                    maxWidth: '850px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                    padding: '20px 28px',
                    borderRadius: '24px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.05)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button
                            onClick={() => setIsReplaying(!isReplaying)}
                            style={{
                                background: isReplaying ? '#EF4444' : '#4F46E5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                width: '48px',
                                height: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isReplaying ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(79, 70, 229, 0.3)',
                                transform: 'scale(1)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {isReplaying ? 
                                <PauseCircleIcon style={{ fontSize: 28 }} /> : 
                                <RouteIcon style={{ fontSize: 28, transform: 'rotate(90deg)' }} /> 
                            }
                        </button>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column'
                                    }}>
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline</span>
                                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B' }}>
                                            {replayIndex !== null && gpsPoints[replayIndex] ? 
                                                new Date(gpsPoints[replayIndex].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : 
                                                '--:--:--'
                                            }
                                        </span>
                                    </div>
                                    <div style={{ width: '1px', height: '24px', background: '#E2E8F0', margin: '0 4px' }}></div>
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column'
                                    }}>
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Speed</span>
                                        {replayIndex !== null && gpsPoints[replayIndex] ? (
                                            <span style={{ fontSize: '16px', fontWeight: 700, color: gpsPoints[replayIndex].speed > speedLimit ? '#EF4444' : '#10B981' }}>
                                                {formatSpeed(gpsPoints[replayIndex].speed)}
                                            </span>
                                        ) : <span style={{ fontSize: '16px', fontWeight: 700, color: '#94A3B8' }}>0 km/h</span>}
                                    </div>
                                </div>
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, background: '#F1F5F9', padding: '4px 10px', borderRadius: '8px' }}>
                                    {replayIndex !== null ? replayIndex + 1 : 0} / {gpsPoints.length} Points
                                </span>
                            </div>
                            <div style={{ position: 'relative', width: '100%', height: '20px', display: 'flex', alignItems: 'center' }}>
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
                                        borderRadius: '3px',
                                        background: '#E2E8F0',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', minWidth: '110px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Playback</span>
                            <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '2px', border: '1px solid #E2E8F0' }}>
                                {[1, 2, 5].map(speed => (
                                    <button
                                        key={speed}
                                        onClick={() => setPlaybackSpeed(speed)}
                                        style={{
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            fontWeight: 800,
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: playbackSpeed === speed ? '#4F46E5' : 'transparent',
                                            color: playbackSpeed === speed ? 'white' : '#64748B',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: playbackSpeed === speed ? '0 2px 6px rgba(79, 70, 229, 0.2)' : 'none'
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
    );
};

export default MapSection;
