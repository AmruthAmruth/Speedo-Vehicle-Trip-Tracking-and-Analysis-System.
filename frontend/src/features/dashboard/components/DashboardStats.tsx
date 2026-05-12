import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import RouteIcon from '@mui/icons-material/Route';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDistance, formatDuration } from '../../../utils/tripUtils';
import { StatCard } from '../../../components/shared/ui/StatCard';

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                label="Total Fleet Trips"
                value={stats.totalTrips}
                icon={<DashboardIcon sx={{ fontSize: 24 }} />}
                trend={{ value: 12, isUp: true }}
            />

            <StatCard
                label="Active Units"
                value={stats.activeTripsCount}
                icon={<GpsFixedIcon sx={{ fontSize: 24 }} />}
                iconClassName={stats.activeTripsCount > 0 ? "text-success bg-success/10" : ""}
            />

            <StatCard
                label="Cumulative Distance"
                value={formatDistance(stats.totalDistance)}
                icon={<RouteIcon sx={{ fontSize: 24 }} />}
                trend={{ value: 8, isUp: true }}
            />

            <StatCard
                label="Fleet Utilization"
                value={formatDuration(stats.totalDuration)}
                icon={<AccessTimeIcon sx={{ fontSize: 24 }} />}
                trend={{ value: 4, isUp: false }}
            />
        </div>
    );
};

export default DashboardStats;

