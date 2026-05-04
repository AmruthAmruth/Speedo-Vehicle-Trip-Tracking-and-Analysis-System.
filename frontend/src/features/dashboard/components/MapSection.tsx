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
    );
};

export default MapSection;
