import React from 'react';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Trip } from '../../../types/trip.types';
import { formatDistance, formatDuration, calculateTripDuration } from '../../../utils/tripUtils';
import Badge from '../../../components/shared/ui/Badge';

interface RecentTripsTableProps {
    trips: Trip[];
}

const RecentTripsTable: React.FC<RecentTripsTableProps> = ({ trips }) => {
    const navigate = useNavigate();

    return (
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

            {trips.length === 0 ? (
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
                            {trips.map((trip) => (
                                <tr key={trip._id} className="border-b border-light-border hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span className="font-semibold text-text-primary">{trip.name}</span>
                                            {trip.isActive && (
                                                <Badge color="red" pulse>
                                                    LIVE
                                                </Badge>
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
    );
};

export default RecentTripsTable;
