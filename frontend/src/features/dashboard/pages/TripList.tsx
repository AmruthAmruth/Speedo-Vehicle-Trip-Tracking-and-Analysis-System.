import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripList } from '../../../hooks/useTripList';
import SearchIcon from '@mui/icons-material/Search';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import TripCard from '../components/TripCard';
import { Button, Input, Card } from '../../../components/shared/ui';

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
            <div className="flex justify-center items-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-brand-500" />
            </div>
        );
    }

    const totalPages = Math.ceil(trips.length / tripsPerPage);
    const paginatedTrips = trips.slice((currentPage - 1) * tripsPerPage, currentPage * tripsPerPage);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Search Bar */}
            <Card className="p-0 border-none shadow-premium overflow-hidden">
                <Input
                    leftIcon={<SearchIcon className="text-slate-400" />}
                    placeholder="Search trips by name or date..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="h-14 rounded-none border-none text-base pl-12 focus-visible:ring-0"
                />
            </Card>

            {/* Trips Grid */}
            {trips.length === 0 ? (
                <Card className="py-20 text-center flex flex-col items-center justify-center">
                    <div className="text-6xl mb-4 opacity-20 grayscale">🚗</div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">
                        {searchQuery ? 'No trips found' : 'No trips yet'}
                    </h4>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8">
                        {searchQuery
                            ? 'Try adjusting your search query to find what you are looking for.'
                            : 'Upload your first GPS trip data to get started with fleet analytics.'}
                    </p>
                    {!searchQuery && (
                        <Button variant="primary" size="lg" onClick={() => navigate('/dashboard/upload')}>
                            Upload Trip Data
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="mt-12 flex flex-col items-center gap-6">
                    <p className="text-sm text-slate-500 font-medium">
                        Showing <span className="text-slate-900 font-bold">{(currentPage - 1) * tripsPerPage + 1}-{Math.min(trips.length, currentPage * tripsPerPage)}</span> of <span className="text-slate-900 font-bold">{trips.length}</span> trips
                    </p>

                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        
                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                                .map((p, i, arr) => (
                                    <React.Fragment key={p}>
                                        {i > 0 && arr[i-1] !== p - 1 && <span className="self-center text-slate-300">...</span>}
                                        <button
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-10 h-10 rounded-xl font-bold transition-all ${
                                                currentPage === p 
                                                ? 'bg-brand-500 text-white shadow-glow shadow-brand-500/20' 
                                                : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    </React.Fragment>
                                ))
                            }
                        </div>

                        <Button 
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
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

