import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripList } from '../../../hooks/useTripList';
import SearchIcon from '@mui/icons-material/Search';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import TripCard from '../components/TripCard';

const TripList: React.FC = () => {
    const { 
        trips, 
        loading, 
        searchQuery, 
        setSearchQuery, 
        isDeleting, 
        deleteTrip 
    } = useTripList();
    
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [tripToDelete, setTripToDelete] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const tripsPerPage = 6;
    const navigate = useNavigate();

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setTripToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!tripToDelete) return;
        const success = await deleteTrip(tripToDelete);
        if (success) {
            setDeleteModalOpen(false);
            setTripToDelete(null);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    const totalPages = Math.ceil(trips.length / tripsPerPage);
    const paginatedTrips = trips.slice((currentPage - 1) * tripsPerPage, currentPage * tripsPerPage);

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
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{
                            width: '100%',
                            padding: '14px 14px 14px 48px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.3s ease',
                        }}
                    />
                </div>
            </div>

            {/* Trips Grid */}
            {trips.length === 0 ? (
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
                    {paginatedTrips.map((trip) => (
                        <TripCard 
                            key={trip._id} 
                            trip={trip} 
                            onDelete={handleDeleteClick} 
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {trips.length > tripsPerPage && (
                <div style={{ 
                    marginTop: '32px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '20px' 
                }}>
                    <div style={{ color: '#718096', fontSize: '14px' }}>
                        Showing <b>{(currentPage - 1) * tripsPerPage + 1}-{Math.min(trips.length, currentPage * tripsPerPage)}</b> of <b>{trips.length}</b> trips
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="btn-secondary"
                            style={{ padding: '8px 16px' }}
                        >
                            Previous
                        </button>
                        
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                                .map((p, i, arr) => (
                                    <React.Fragment key={p}>
                                        {i > 0 && arr[i-1] !== p - 1 && <span style={{ alignSelf: 'center' }}>...</span>}
                                        <button
                                            onClick={() => setCurrentPage(p)}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '8px',
                                                border: '1px solid',
                                                borderColor: currentPage === p ? '#6366f1' : '#e2e8f0',
                                                background: currentPage === p ? '#6366f1' : '#ffffff',
                                                color: currentPage === p ? '#ffffff' : '#475569',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {p}
                                        </button>
                                    </React.Fragment>
                                ))
                            }
                        </div>

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="btn-secondary"
                            style={{ padding: '8px 16px' }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <ConfirmationModal
                open={deleteModalOpen}
                title="Delete Trip"
                message="Are you sure you want to delete this trip and all its GPS data? This action cannot be undone."
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModalOpen(false)}
                loading={isDeleting}
                danger
            />
        </div>
    );
};

export default TripList;
