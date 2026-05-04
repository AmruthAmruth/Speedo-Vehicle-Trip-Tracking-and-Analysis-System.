import React from 'react';
import RouteIcon from '@mui/icons-material/Route';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SpeedIcon from '@mui/icons-material/Speed';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { formatDistance, formatDuration, formatSpeed } from '../../../utils/tripUtils';
import StatCard from '../../../components/shared/ui/StatCard';

interface TripStatsGridProps {
    stats: {
        distance: number;
        avgSpeed: number;
        maxSpeed: number;
        idling: number;
        stoppage: number;
        duration: number;
    };
    gpsPointsCount: number;
}

const TripStatsGrid: React.FC<TripStatsGridProps> = ({ stats, gpsPointsCount }) => {
    return (
        <div className="stats-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <StatCard
                label="Total Distance"
                value={formatDistance(stats.distance)}
                icon={<RouteIcon style={{ fontSize: 28 }} />}
            />

            <StatCard
                label="Duration"
                value={formatDuration(stats.duration)}
                icon={<AccessTimeIcon style={{ fontSize: 28 }} />}
                iconColor="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            />

            <StatCard
                label="Avg Speed"
                value={formatSpeed(stats.avgSpeed)}
                icon={<SpeedIcon style={{ fontSize: 28 }} />}
                iconColor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                subValue={`Max: ${formatSpeed(stats.maxSpeed)}`}
            />

            <StatCard
                label="Idling Time"
                value={formatDuration(stats.idling)}
                icon={<PauseCircleIcon style={{ fontSize: 28 }} />}
                iconColor="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            />

            <StatCard
                label="Stoppage Time"
                value={formatDuration(stats.stoppage)}
                icon={<StopCircleIcon style={{ fontSize: 28 }} />}
                iconColor="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
            />

            <StatCard
                label="GPS Points"
                value={gpsPointsCount}
                icon={<LocationOnIcon style={{ fontSize: 28 }} />}
                iconColor="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
            />
        </div>
    );
};

export default TripStatsGrid;
