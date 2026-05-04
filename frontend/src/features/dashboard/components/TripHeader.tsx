import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Trip } from '../../../types/trip.types';
import { formatDate } from '../../../utils/tripUtils';
import Badge from '../../../components/shared/ui/Badge';

interface TripHeaderProps {
    trip: Trip;
    isSimulating: boolean;
    onStartSimulation: () => void;
    onStopSimulation: () => void;
    onEndLiveTrip: () => void;
    onDeleteTrip: () => void;
}

const TripHeader: React.FC<TripHeaderProps> = ({
    trip,
    isSimulating,
    onStartSimulation,
    onStopSimulation,
    onEndLiveTrip,
    onDeleteTrip
}) => {
    const navigate = useNavigate();

    return (
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
                            onClick={onStartSimulation}
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
                            onClick={onStopSimulation}
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
                            onClick={onEndLiveTrip}
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
                        onClick={onDeleteTrip}
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
                    <Badge color="red" pulse>
                        LIVE
                    </Badge>
                )}
            </div>
            <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
                {formatDate(trip.startTime)} {trip.isActive ? '- Ongoing' : `- ${formatDate(trip.endTime)}`}
            </p>
        </div>
    );
};

export default TripHeader;
