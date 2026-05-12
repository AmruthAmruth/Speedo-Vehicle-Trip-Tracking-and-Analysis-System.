import React from 'react';
import { GPSPoint } from '../../../types/trip.types';
import { formatSpeed } from '../../../utils/tripUtils';
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

interface GPSPointsTableProps {
    gpsPoints: GPSPoint[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    setItemsPerPage: (count: number) => void;
}

const GPSPointsTable: React.FC<GPSPointsTableProps> = ({
    gpsPoints,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage
}) => {
    const totalPages = Math.ceil(gpsPoints.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPoints = gpsPoints.slice(startIndex, startIndex + itemsPerPage);

    return (
        <Card className="p-0 border-slate-100 overflow-hidden shadow-premium">
            <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                    <CardTitle>GPS Data Stream</CardTitle>
                    <CardDescription>{gpsPoints.length} points recorded for this session</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rows:</span>
                    <select 
                        value={itemsPerPage} 
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                        {[10, 25, 50, 100].map(count => (
                            <option key={count} value={count}>{count}</option>
                        ))}
                    </select>
                </div>
            </CardHeader>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Coordinates</TableHead>
                            <TableHead>Speed</TableHead>
                            <TableHead>Ignition</TableHead>
                            <TableHead>Battery</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedPoints.map((point) => (
                            <TableRow key={point._id} className="group">
                                <TableCell className="font-medium text-slate-700">
                                    {new Date(point.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-slate-500">
                                    {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                                </TableCell>
                                <TableCell>
                                    <span className={point.speed > 80 ? 'text-error font-bold' : 'text-success-dark font-bold'}>
                                        {formatSpeed(point.speed)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={point.ignition ? 'success' : 'error'} size="sm">
                                        {point.ignition ? 'ON' : 'OFF'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500">
                                    {(point as any).batteryLevel ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-brand-500" 
                                                    style={{ width: `${(point as any).batteryLevel}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold">{(point as any).batteryLevel}%</span>
                                        </div>
                                    ) : '—'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="p-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Showing <span className="text-slate-900">{startIndex + 1}</span> to <span className="text-slate-900">{Math.min(startIndex + itemsPerPage, gpsPoints.length)}</span> of <span className="text-slate-900">{gpsPoints.length}</span>
                </span>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default GPSPointsTable;

