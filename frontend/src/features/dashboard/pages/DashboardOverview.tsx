import React from 'react';
import { useDashboardData } from '../../../hooks/useDashboard';

// Components
import DashboardStats from '../components/DashboardStats';
import QuickActions from '../components/QuickActions';
import RecentTripsTable from '../components/RecentTripsTable';
import LiveFleetMonitor from '../components/LiveFleetMonitor';
import LinkMobileModal from '../components/LinkMobileModal';
import { Card } from '../../../components/shared/ui';

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
            <div className="flex justify-center items-center py-24">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-brand-500" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Welcome Section */}
            <header className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl" />
                <div className="relative">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Dashboard <span className="text-brand-500">Overview</span>
                    </h2>
                    <p className="text-lg text-slate-500 font-medium">
                        Real-time intelligence and fleet telemetry at your fingertips.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <DashboardStats stats={stats} />
                    
                    {/* Recent Trips */}
                    <RecentTripsTable trips={trips.slice(0, 5)} />
                </div>

                <div className="space-y-8">
                    {/* Live Fleet Status Widget */}
                    <LiveFleetMonitor activeTripsCount={stats.activeTripsCount} />
                    
                    {/* Quick Actions */}
                    <QuickActions onStartLiveTracking={startLiveTrip} />
                </div>
            </div>

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

