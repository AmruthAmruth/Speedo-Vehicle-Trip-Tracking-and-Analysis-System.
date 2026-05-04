import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import RouteIcon from '@mui/icons-material/Route';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDistance, formatDuration } from '../../../utils/tripUtils';
import StatCard from '../../../components/shared/ui/StatCard';

interface DashboardStatsProps {
    stats: {
        totalTrips: number;
        totalDistance: number;
        totalDuration: number;
        activeTripsCount: number;
    };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
    return (
        <div className="stats-grid">
            <StatCard
                label="Total Trips"
                value={stats.totalTrips}
                icon={<DashboardIcon style={{ fontSize: 28 }} />}
            />

            <StatCard
                label="Active Trips"
                value={stats.activeTripsCount}
                icon={<GpsFixedIcon style={{ fontSize: 28 }} />}
                iconColor="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            />

            <StatCard
                label="Total Distance"
                value={formatDistance(stats.totalDistance)}
                icon={<RouteIcon style={{ fontSize: 28 }} />}
                className="bg-gradient-to-br from-accent-violet to-accent-rose"
            />

            <StatCard
                label="Total Duration"
                value={formatDuration(stats.totalDuration)}
                icon={<AccessTimeIcon style={{ fontSize: 28 }} />}
                className="bg-gradient-to-br from-accent-blue to-accent-teal"
            />
        </div>
    );
};

export default DashboardStats;
