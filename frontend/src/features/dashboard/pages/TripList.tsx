import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripList } from '../../../hooks/useTripList';
import SearchIcon from '@mui/icons-material/Search';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import TripCard from '../components/TripCard';
import { Button, Input } from '../../../components/shared/ui';

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
    const tripsPerPage = 9;
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
            <div className="flex justify-center items-center py-40">
                <div className="h-10 w-10 animate-spin border-2 border-slate-200 border-t-black rounded-full" />
            </div>
        );
    }

    const totalPages = Math.ceil(trips.length / tripsPerPage);
    const paginatedTrips = trips.slice((currentPage - 1) * tripsPerPage, currentPage * tripsPerPage);

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20 pt-8 px-4">
            {/* Header & Search */}
            <header className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-100 pb-10 gap-8">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                            Fleet History
                        </h1>
                        <p className="text-slate-500 font-medium tracking-tight">
                            Browse and analyze all previous fleet telemetry sessions.
                        </p>
                    </div>
                    <div className="w-full md:w-96">
                        <Input
                            leftIcon={<SearchIcon className="text-slate-400" />}
                            placeholder="Search by name or date..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-12 rounded-2xl bg-slate-50 border-none shadow-soft"
                        />
                    </div>
                </div>
            </header>

            {/* Trips Grid */}
            {trips.length === 0 ? (
                <div className="py-32 text-center flex flex-col items-center justify-center bg-white border border-slate-100 rounded-3xl shadow-soft">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-6 grayscale opacity-40">🚗</div>
                    <h4 className="text-2xl font-bold text-slate-900 mb-2">
                        {searchQuery ? 'No results found' : 'History is empty'}
                    </h4>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
                        {searchQuery
                            ? `We couldn't find any trips matching "${searchQuery}". Try a different search term.`
                            : 'Once you start tracking trips or upload GPS data, they will appear here for deep analysis.'}
                    </p>
                    {!searchQuery && (
                        <Button variant="primary" size="lg" onClick={() => navigate('/dashboard/upload')} className="bg-black text-white px-10 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">
                            Begin First Trip
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <div className="mt-16 flex flex-col items-center gap-8 pt-12 border-t border-slate-50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Showing {(currentPage - 1) * tripsPerPage + 1}-{Math.min(trips.length, currentPage * tripsPerPage)} of {trips.length} sessions
                    </p>

                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="rounded-xl border-slate-100 h-10 px-6"
                        >
                            Prev
                        </Button>
                        
                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                                .map((p, i, arr) => (
                                    <React.Fragment key={p}>
                                        {i > 0 && arr[i-1] !== p - 1 && <span className="self-center text-slate-300">...</span>}
                                        <button
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-10 h-10 rounded-xl font-bold transition-all text-xs ${
                                                currentPage === p 
                                                ? 'bg-black text-white shadow-soft' 
                                                : 'text-slate-400 hover:bg-slate-50'
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
                            className="rounded-xl border-slate-100 h-10 px-6"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmationModal
                open={deleteModalOpen}
                title="Delete Trip"
                message="Are you sure you want to permanently remove this trip and its telemetry data? This action is irreversible."
                confirmText="Delete Session"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModalOpen(false)}
                loading={isDeleting}
                danger
            />
        </div>
    );
};

export default TripList;


