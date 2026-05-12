import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Trip } from '../../../types/trip.types';
import { formatDistance, formatDuration, calculateTripDuration } from '../../../utils/tripUtils';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow,
    Badge,
    Button
} from '../../../components/shared/ui';

interface RecentTripsTableProps {
    trips: Trip[];
}

const RecentTripsTable: React.FC<RecentTripsTableProps> = ({ trips }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Pagination Logic
    const totalPages = Math.ceil(trips.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTrips = trips.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (trips.length === 0) {
        return (
            <div className="py-24 text-center flex flex-col items-center justify-center bg-white border border-slate-100 rounded-3xl shadow-soft">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mb-4 grayscale opacity-40">📍</div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">No fleet activity found</h4>
                <p className="text-slate-400 font-medium mb-8 max-w-xs">Start a live tracking session or upload legacy data to populate this table.</p>
                <Button variant="primary" size="md" onClick={() => navigate('/dashboard/upload')} className="rounded-2xl px-8 h-12 bg-black">
                    <UploadFileIcon className="mr-2 h-4 w-4" />
                    Upload Your First Trip
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-50">
                            <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px] text-slate-400 pl-6">Trip Identifier</TableHead>
                            <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px] text-slate-400">Telemetry Date</TableHead>
                            <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px] text-slate-400">Distance</TableHead>
                            <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px] text-slate-400">Active Duration</TableHead>
                            <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px] text-slate-400 text-right pr-6">Commands</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTrips.map((trip) => (
                            <TableRow key={trip._id} className="group border-slate-50/50 hover:bg-slate-50/50 transition-colors">
                                <TableCell className="pl-6">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-900">{trip.name}</span>
                                        {trip.isActive && (
                                            <Badge variant="primary" pulse size="sm" className="bg-black text-white border-none">
                                                LIVE
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-500 font-medium text-sm">
                                    {new Date(trip.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </TableCell>
                                <TableCell className="text-slate-500 font-medium text-sm">
                                    {formatDistance(trip.totalDistance)}
                                </TableCell>
                                <TableCell className="text-slate-500 font-medium text-sm">
                                    {trip.isActive ? (
                                        <span className="font-bold text-black flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                                            Active Now
                                        </span>
                                    ) : (
                                        formatDuration(calculateTripDuration(trip.startTime, trip.endTime))
                                    )}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <button
                                        className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
                                        onClick={() => navigate(`/dashboard/trips/${trip._id}`)}
                                    >
                                        Analyze →
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Premium Pagination Footer */}
            <div className="flex items-center justify-between px-6 py-6 border-t border-slate-50 bg-white">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, trips.length)} of {trips.length}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-slate-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600"
                    >
                        <KeyboardArrowLeftIcon fontSize="small" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                                    currentPage === page 
                                        ? "bg-black text-white shadow-soft" 
                                        : "text-slate-400 hover:bg-slate-50"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-slate-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600"
                    >
                        <KeyboardArrowRightIcon fontSize="small" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecentTripsTable;


