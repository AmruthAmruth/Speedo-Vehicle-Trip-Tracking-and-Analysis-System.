import React from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RouteIcon from '@mui/icons-material/Route';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import { Trip } from '../../../types/trip.types';
import { formatDistance, formatDuration, calculateTripDuration, formatDate } from '../../../utils/tripUtils';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../../components/shared/ui';

interface TripCardProps {
    trip: Trip;
    onDelete: (e: React.MouseEvent, id: string) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onDelete }) => {
    const navigate = useNavigate();

    return (
        <Card 
            className="group cursor-pointer overflow-hidden"
            onClick={() => navigate(`/dashboard/trips/${trip._id}`)}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <CardTitle className="text-xl line-clamp-1">{trip.name}</CardTitle>
                    <div className="flex items-center gap-2 text-slate-400 font-medium text-xs">
                        <CalendarTodayIcon sx={{ fontSize: 14 }} />
                        <span>{formatDate(trip.startTime)}</span>
                    </div>
                </div>
                <IconButton 
                    size="small" 
                    onClick={(e) => onDelete(e, trip._id)}
                    className="text-slate-300 hover:text-error hover:bg-error-light/10 transition-colors"
                >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-50 space-y-1 transition-colors group-hover:bg-brand-50/50 group-hover:border-brand-100">
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-brand-500">
                        <RouteIcon sx={{ fontSize: 16 }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Distance</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800">
                        {formatDistance(trip.totalDistance)}
                    </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-50 space-y-1 transition-colors group-hover:bg-brand-50/50 group-hover:border-brand-100">
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-brand-500">
                        <AccessTimeIcon sx={{ fontSize: 16 }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Duration</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800">
                        {formatDuration(calculateTripDuration(trip.startTime, trip.endTime))}
                    </p>
                </div>
            </div>

            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-6">
                <span className="bg-slate-100 px-2 py-0.5 rounded">Idling: {formatDuration(trip.totalIdlingTime)}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">Stop: {formatDuration(trip.totalStoppageTime)}</span>
            </div>

            <Button 
                variant="primary" 
                className="w-full rounded-xl py-5 shadow-none group-hover:shadow-glow group-hover:bg-brand-600"
            >
                View Details
            </Button>
        </Card>
    );
};

export default TripCard;

