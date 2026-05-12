import React from 'react';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Trip } from '../../../types/trip.types';
import { formatDistance, formatDuration, calculateTripDuration } from '../../../utils/tripUtils';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    Badge,
    Button
} from '../../../components/shared/ui';

interface RecentTripsTableProps {
    trips: Trip[];
}

const RecentTripsTable: React.FC<RecentTripsTableProps> = ({ trips }) => {
    const navigate = useNavigate();

    return (
        <Card className="p-0 border-slate-100 overflow-hidden shadow-premium">
            <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Fleet Activity</CardTitle>
                    <CardDescription>A summary of the last 5 trips recorded</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/trips')}>
                    View All Activity
                </Button>
            </CardHeader>

            {trips.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                    <div className="text-5xl mb-4 opacity-20 grayscale">📍</div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">No trips yet</h4>
                    <p className="text-slate-500 text-sm mb-6">Upload your first GPS trip data to get started</p>
                    <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/upload')}>
                        <UploadFileIcon className="mr-2 h-4 w-4" />
                        Upload Trip
                    </Button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Trip Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Distance</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trips.map((trip) => (
                                <TableRow key={trip._id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-800">{trip.name}</span>
                                            {trip.isActive && (
                                                <Badge variant="error" pulse size="sm">
                                                    LIVE
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 font-medium">
                                        {new Date(trip.startTime).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-slate-500 font-medium">
                                        {formatDistance(trip.totalDistance)}
                                    </TableCell>
                                    <TableCell className="text-slate-500 font-medium">
                                        {trip.isActive ? (
                                            <span className="text-brand-500 font-bold">Ongoing</span>
                                        ) : (
                                            formatDuration(calculateTripDuration(trip.startTime, trip.endTime))
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 font-bold"
                                            onClick={() => navigate(`/dashboard/trips/${trip._id}`)}
                                        >
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </Card>
    );
};

export default RecentTripsTable;

