import React from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RouteIcon from '@mui/icons-material/Route';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import { Trip } from '../../../types/trip.types';
import { formatDistance, formatDuration, calculateTripDuration, formatDate } from '../../../utils/tripUtils';

interface TripCardProps {
    trip: Trip;
    onDelete: (e: React.MouseEvent, id: string) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onDelete }) => {
    const navigate = useNavigate();

    return (
        <div
            className="dashboard-card"
            style={{ 
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0, 0, 0, 0.1), 0 8px 8px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => navigate(`/dashboard/trips/${trip._id}`)}
        >
            {/* Trip Header */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#2d3748', margin: '0 0 8px 0' }}>
                        {trip.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#718096', fontSize: '13px' }}>
                        <CalendarTodayIcon style={{ fontSize: 16 }} />
                        <span>{formatDate(trip.startTime)}</span>
                    </div>
                </div>
                <button
                    onClick={(e) => onDelete(e, trip._id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#E53E3E',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FED7D7')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    title="Delete Trip"
                >
                    <DeleteIcon style={{ fontSize: 20 }} />
                </button>
            </div>

            {/* Trip Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div
                    style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        borderRadius: '8px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <RouteIcon style={{ fontSize: 18, color: '#667eea' }} />
                        <span style={{ fontSize: '12px', color: '#718096' }}>Distance</span>
                    </div>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#2d3748', margin: 0 }}>
                        {formatDistance(trip.totalDistance)}
                    </p>
                </div>

                <div
                    style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)',
                        borderRadius: '8px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <AccessTimeIcon style={{ fontSize: 18, color: '#4facfe' }} />
                        <span style={{ fontSize: '12px', color: '#718096' }}>Duration</span>
                    </div>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#2d3748', margin: 0 }}>
                        {formatDuration(calculateTripDuration(trip.startTime, trip.endTime))}
                    </p>
                </div>
            </div>

            {/* Additional Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#718096' }}>
                <span>Idling: {formatDuration(trip.totalIdlingTime)}</span>
                <span>Stoppage: {formatDuration(trip.totalStoppageTime)}</span>
            </div>

            {/* View Button */}
            <button
                className="btn-primary"
                style={{ 
                    width: '100%', 
                    marginTop: '16px', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: 600
                }}
            >
                View Details
            </button>
        </div>
    );
};

export default TripCard;
