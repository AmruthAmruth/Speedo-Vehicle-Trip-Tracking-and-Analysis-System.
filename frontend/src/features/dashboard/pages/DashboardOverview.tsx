import React from 'react';
import { useDashboardData } from '../../../hooks/useDashboard';

// Components
import DashboardStats from '../components/DashboardStats';
import QuickActions from '../components/QuickActions';
import RecentTripsTable from '../components/RecentTripsTable';
import LiveFleetMonitor from '../components/LiveFleetMonitor';
import LinkMobileModal from '../components/LinkMobileModal';

const DashboardOverview: React.FC = () => {
    const { 
        trips, 
        loading, 
        stats, 
        activeTripId, 
        qrModalOpen, 
        setQrModalOpen, 
        startLiveTrip 
    } = useDashboardData();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-overview">
            {/* Welcome Section */}
            <div className="welcome-section mb-8">
                <h2 className="text-3xl font-bold text-text-primary mb-2">
                    Welcome to Your Dashboard
                </h2>
                <p className="text-base text-text-secondary">
                    Track and analyze your vehicle trips with precision
                </p>
            </div>

            {/* Live Fleet Status Widget */}
            <LiveFleetMonitor activeTripsCount={stats.activeTripsCount} />

            {/* Stats Grid */}
            <DashboardStats stats={stats} />

            {/* Quick Actions */}
            <QuickActions onStartLiveTracking={startLiveTrip} />

            {/* Recent Trips */}
            <RecentTripsTable trips={trips.slice(0, 5)} />

            {/* QR Code Handshake Modal */}
            <LinkMobileModal 
                open={qrModalOpen} 
                onClose={() => setQrModalOpen(false)} 
                activeTripId={activeTripId} 
            />
        </div>
    );
};

export default DashboardOverview;
