import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../../../services/tripApi';
import { Trip } from '../../../types/trip.types';
import { formatDistance, formatDuration, calculateTripDuration, formatDate } from '../../../utils/tripUtils';
import SearchIcon from '@mui/icons-material/Search';
import RouteIcon from '@mui/icons-material/Route';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';

const TripList: React.FC = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const tripsPerPage = 6;
    const navigate = useNavigate();

    useEffect(() => {
        loadTrips();
    }, []);

    useEffect(() => {
        filterTrips();
    }, [searchQuery, trips]);

    const loadTrips = async () => {
        try {
            const response = await tripApi.getUserTrips();
            setTrips(response.trips);
            setFilteredTrips(response.trips);
        } catch (error) {
            console.error('Failed to load trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTrips = () => {
        if (!searchQuery.trim()) {
            setFilteredTrips(trips);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = trips.filter(
            (trip) =>
                trip.name.toLowerCase().includes(query) ||
                formatDate(trip.startTime).toLowerCase().includes(query)
        );
        setFilteredTrips(filtered);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this trip and all its GPS data? This cannot be undone.')) {
            try {
                await tripApi.deleteTrip(id);
                setTrips(trips.filter(t => t._id !== id));
            } catch (error) {
                console.error('Failed to delete trip:', error);
                alert('Failed to delete trip');
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

    return (
        <div className="trip-list">
            {/* Search Bar */}
            <div className="dashboard-card" style={{ marginBottom: '24px' }}>
                <div style={{ position: 'relative' }}>
                    <SearchIcon
                        style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#718096',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search trips by name or date..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px 14px 14px 48px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.3s ease',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                        onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                    />
                </div>
            </div>

            {/* Trips Grid */}
            {filteredTrips.length === 0 ? (
                <div className="dashboard-card">
                    <div className="empty-state">
                        <div className="empty-icon">🚗</div>
                        <h4 className="empty-title">
                            {searchQuery ? 'No trips found' : 'No trips yet'}
                        </h4>
                        <p className="empty-description">
                            {searchQuery
                                ? 'Try adjusting your search query'
                                : 'Upload your first GPS trip data to get started'}
                        </p>
                        {!searchQuery && (
                            <button className="btn-primary" onClick={() => navigate('/dashboard/upload')}>
                                Upload Trip
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {filteredTrips
                        .slice((currentPage - 1) * tripsPerPage, currentPage * tripsPerPage)
                        .map((trip) => (
                        <div
                            key={trip._id}
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
                                    onClick={(e) => handleDelete(e, trip._id)}
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/dashboard/trips/${trip._id}`);
                                }}
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Results Count and Pagination */}
            {filteredTrips.length > 0 && (
                <div style={{ 
                    marginTop: '32px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '20px' 
                }}>
                    <div style={{ color: '#718096', fontSize: '14px', fontWeight: 500 }}>
                        Showing <span style={{ color: '#2d3748', fontWeight: 700 }}>
                            {(currentPage - 1) * tripsPerPage + 1}-{Math.min(filteredTrips.length, currentPage * tripsPerPage)}
                        </span> of <span style={{ color: '#2d3748', fontWeight: 700 }}>{filteredTrips.length}</span> trips
                    </div>

                    {filteredTrips.length > tripsPerPage && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    background: currentPage === 1 ? '#f8fafc' : '#ffffff',
                                    color: currentPage === 1 ? '#cbd5e1' : '#475569',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: currentPage === 1 ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
                                }}
                            >
                                Previous
                            </button>

                            <div style={{ display: 'flex', gap: '6px' }}>
                                {Array.from({ length: Math.ceil(filteredTrips.length / tripsPerPage) }, (_, i) => {
                                    const pageNum = i + 1;
                                    const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);
                                    
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
                                                    width: '42px',
                                                    height: '42px',
                                                    borderRadius: '12px',
                                                    border: '1px solid',
                                                    borderColor: currentPage === pageNum ? '#6366f1' : '#e2e8f0',
                                                    background: currentPage === pageNum ? '#6366f1' : '#ffffff',
                                                    color: currentPage === pageNum ? '#ffffff' : '#475569',
                                                    fontSize: '14px',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: currentPage === pageNum ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
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
                                        return <span key={pageNum} style={{ color: '#94a3b8', alignSelf: 'center' }}>...</span>;
                                    }

                                    return null;
                                })}
                            </div>

                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredTrips.length / tripsPerPage), prev + 1))}
                                disabled={currentPage >= Math.ceil(filteredTrips.length / tripsPerPage)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    background: currentPage >= Math.ceil(filteredTrips.length / tripsPerPage) ? '#f8fafc' : '#ffffff',
                                    color: currentPage >= Math.ceil(filteredTrips.length / tripsPerPage) ? '#cbd5e1' : '#475569',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: currentPage >= Math.ceil(filteredTrips.length / tripsPerPage) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: currentPage >= Math.ceil(filteredTrips.length / tripsPerPage) ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TripList;
