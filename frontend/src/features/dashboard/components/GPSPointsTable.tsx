import React from 'react';
import { GPSPoint } from '../../../types/trip.types';
import { formatSpeed } from '../../../utils/tripUtils';

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
        <div className="dashboard-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 className="card-title">GPS Points</h3>
                    <p className="card-subtitle">{gpsPoints.length} points recorded</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Rows per page:</span>
                    <select 
                        value={itemsPerPage} 
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                    >
                        {[10, 25, 50, 100].map(count => (
                            <option key={count} value={count}>{count}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-2 border-light-border">
                            <th className="p-3 text-left text-text-secondary font-semibold">Timestamp</th>
                            <th className="p-3 text-left text-text-secondary font-semibold">Coordinates</th>
                            <th className="p-3 text-left text-text-secondary font-semibold">Speed</th>
                            <th className="p-3 text-left text-text-secondary font-semibold">Ignition</th>
                            <th className="p-3 text-left text-text-secondary font-semibold">Battery</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPoints.map((point) => (
                            <tr key={point._id} className="border-b border-light-border hover:bg-slate-50 transition-colors">
                                <td className="p-3 text-sm text-text-primary">
                                    {new Date(point.timestamp).toLocaleString()}
                                </td>
                                <td className="p-3 text-sm text-text-secondary">
                                    {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                                </td>
                                <td className="p-3 text-sm">
                                    <span style={{ 
                                        fontWeight: 600,
                                        color: point.speed > 80 ? '#EF4444' : '#10B981'
                                    }}>
                                        {formatSpeed(point.speed)}
                                    </span>
                                </td>
                                <td className="p-3 text-sm">
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        background: point.ignition ? '#DCFCE7' : '#FEE2E2',
                                        color: point.ignition ? '#166534' : '#991B1B'
                                    }}>
                                        {point.ignition ? 'ON' : 'OFF'}
                                    </span>
                                </td>
                                <td className="p-3 text-sm text-text-secondary">
                                    {point.batteryLevel ? `${point.batteryLevel}%` : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, gpsPoints.length)} of {gpsPoints.length}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                        className="btn-secondary" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                        Prev
                    </button>
                    <button 
                        className="btn-secondary" 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GPSPointsTable;
