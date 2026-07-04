import React from 'react';
import { useDashboardData } from '../../../hooks/useDashboard';

// Components
import DashboardStats from '../components/DashboardStats';
import QuickActions from '../components/QuickActions';
import RecentTripsTable from '../components/RecentTripsTable';
import LiveFleetMonitor from '../components/LiveFleetMonitor';
import LinkMobileModal from '../components/LinkMobileModal';
import { Card } from '../../../components/shared/ui';
import { useAuth } from '../../../context/AuthContext';

const DashboardOverview: React.FC = () => {
    const { user } = useAuth();
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
            <div className="flex justify-center items-center py-40">
                <div className="h-10 w-10 animate-spin border-2 border-slate-200 border-t-black rounded-full" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20 pt-8 px-4">
            {/* Standard Minimal Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-100 pb-10 gap-8">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">
                        Welcome back, {user?.name || 'Commander'}. Fleet telemetry is active.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">System Live</span>
                </div>
            </header>

            {/* Metrics Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Quick Stats</span>
                    <div className="h-px flex-grow bg-slate-50" />
                </div>
                <DashboardStats stats={stats} />
            </section>

            {/* Middle Section: Actions & Live Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-10">
                    <section className="space-y-6">
                        <h2 className="text-lg font-bold tracking-tight text-slate-800">Deployment Hub</h2>
                        <QuickActions onStartLiveTracking={startLiveTrip} />
                    </section>
                </div>
                <div className="lg:col-span-4">
                    <section className="space-y-6">
                        <h2 className="text-lg font-bold tracking-tight text-slate-800">Fleet Status</h2>
                        <LiveFleetMonitor activeTripsCount={stats.activeTripsCount} />
                    </section>
                </div>
            </div>

            {/* Bottom Section: Full Width Activity Table */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-t border-slate-100 pt-12">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Recent Activity</h2>
                        <p className="text-sm text-slate-500 font-medium">Detailed log of recent fleet movements and telemetry sessions.</p>
                    </div>
                    <button className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors" onClick={() => {}}>View Full Archive</button>
                </div>
                <Card className="p-0 overflow-hidden border-slate-100 bg-white shadow-soft">
                    <RecentTripsTable trips={trips} />
                </Card>
            </section>

            {/* Mobile Connection Prompt */}
            <section className="pt-10">
                <div className="bg-slate-50 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-xl font-bold text-slate-900">Sync Your Mobile Device</h3>
                        <p className="text-slate-600 font-medium max-w-md">
                            Turn your phone into a live GPS tracker and broadcast telemetry data directly to this dashboard in real-time.
                        </p>
                    </div>
                    <button 
                        onClick={() => setQrModalOpen(true)}
                        className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all active:scale-95 shadow-soft"
                    >
                        Connect New Device
                    </button>
                </div>
            </section>

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



