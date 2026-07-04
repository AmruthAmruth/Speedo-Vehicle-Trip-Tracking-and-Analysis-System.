import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi } from '../../../services/tripApi';
import { GPSPoint } from '../../../types/trip.types';
import { useTripData, useRealTimeTrip } from '../../../hooks/useTrip';
import { useTripPlayback } from '../../../hooks/useTripPlayback';
import { useTripStats } from '../../../hooks/useTripStats';
import { toast } from 'react-toastify';

// Components
import TripHeader from '../components/TripHeader';
import TripStatsGrid from '../components/TripStatsGrid';
import DriverBehaviorInsight from '../components/DriverBehaviorInsight';
import MapSection from '../components/MapSection';
import GPSPointsTable from '../components/GPSPointsTable';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';

const TripDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // Custom Hooks for State & Logic
    const { trip, gpsPoints, setGpsPoints, loading, reload } = useTripData(id);
    const { 
        replayIndex, 
        setReplayIndex, 
        isReplaying, 
        setIsReplaying, 
        playbackSpeed, 
        setPlaybackSpeed 
    } = useTripPlayback(gpsPoints.length);

    // Settings State
    const [speedLimit, setSpeedLimit] = useState(80);
    const [showStoppages, setShowStoppages] = useState(true);
    const [showIdling, setShowIdling] = useState(true);
    const [isSimulating, setIsSimulating] = useState(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal State
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        type: 'delete' | 'end_live' | null;
        title: string;
        message: string;
        danger: boolean;
    }>({
        open: false,
        type: null,
        title: '',
        message: '',
        danger: false
    });
    const [actionLoading, setActionLoading] = useState(false);

    // Stats Calculation Hook
    const { stats, driverInsight } = useTripStats(gpsPoints, replayIndex, speedLimit);

    // Real-Time Updates
    const handleRealTimePoint = useCallback((newPoint: GPSPoint) => {
        setGpsPoints(prev => {
            if (prev.some(p => p._id === newPoint._id)) return prev;
            const next = [...prev, newPoint];
            // Auto-advance replay index if at end
            if (replayIndex === null || replayIndex === prev.length - 1) {
                setReplayIndex(next.length - 1);
            }
            return next;
        });
    }, [replayIndex, setReplayIndex, setGpsPoints]);

    useRealTimeTrip(id, handleRealTimePoint);

    // Action Handlers
    const handleStartSimulation = async () => {
        try {
            setIsSimulating(true);
            setGpsPoints([]);
            setReplayIndex(null);
            await tripApi.startSimulation(id!);
            toast.info('Simulation started');
        } catch (error) {
            toast.error('Failed to start simulation');
            setIsSimulating(false);
        }
    };

    const handleStopSimulation = async () => {
        try {
            await tripApi.stopSimulation(id!);
            toast.info('Simulation stopped');
            setIsSimulating(false);
            reload();
        } catch (error) {
            toast.error('Failed to stop simulation');
        }
    };

    const handleDeleteTrip = () => {
        setConfirmModal({
            open: true,
            type: 'delete',
            title: 'Delete Trip',
            message: 'Are you sure you want to delete this trip and all its GPS data? This action cannot be undone.',
            danger: true
        });
    };

    const handleEndLiveTrip = () => {
        setConfirmModal({
            open: true,
            type: 'end_live',
            title: 'End Live Trip',
            message: 'Are you sure you want to end this live tracking session?',
            danger: true
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.type) return;

        setActionLoading(true);
        try {
            if (confirmModal.type === 'delete') {
                await tripApi.deleteTrip(id!);
                toast.success('Trip deleted successfully');
                navigate('/dashboard/trips');
            } else if (confirmModal.type === 'end_live') {
                await tripApi.stopLiveTrip(id!);
                toast.success('Live trip ended successfully');
                reload();
            }
        } catch (error) {
            toast.error(`Failed to ${confirmModal.type.replace('_', ' ')} trip`);
        } finally {
            setActionLoading(false);
            setConfirmModal(prev => ({ ...prev, open: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40">
                <div className="h-10 w-10 animate-spin border-2 border-slate-200 border-t-black rounded-full" />
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="dashboard-card">
                <div className="empty-state">
                    <div className="empty-icon">❌</div>
                    <h4 className="empty-title">Trip not found</h4>
                    <p className="empty-description">The trip you're looking for doesn't exist</p>
                    <button className="btn-primary" onClick={() => navigate('/dashboard/trips')}>
                        Back to Trips
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="trip-details">
            <TripHeader 
                trip={trip}
                isSimulating={isSimulating}
                onStartSimulation={handleStartSimulation}
                onStopSimulation={handleStopSimulation}
                onEndLiveTrip={handleEndLiveTrip}
                onDeleteTrip={handleDeleteTrip}
            />

            <TripStatsGrid 
                stats={stats}
                gpsPointsCount={gpsPoints.length}
            />

            <DriverBehaviorInsight 
                insight={driverInsight}
                isLive={isSimulating || !!trip.isActive}
            />

            <MapSection 
                gpsPoints={gpsPoints}
                tripName={trip.name}
                speedLimit={speedLimit}
                setSpeedLimit={setSpeedLimit}
                showStoppages={showStoppages}
                setShowStoppages={setShowStoppages}
                showIdling={showIdling}
                setShowIdling={setShowIdling}
                replayIndex={replayIndex}
                setReplayIndex={setReplayIndex}
                isReplaying={isReplaying}
                setIsReplaying={setIsReplaying}
                playbackSpeed={playbackSpeed}
                setPlaybackSpeed={setPlaybackSpeed}
            />

            <GPSPointsTable 
                gpsPoints={gpsPoints}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
            />

            <ConfirmationModal
                open={confirmModal.open}
                title={confirmModal.title}
                message={confirmModal.message}
                danger={confirmModal.danger}
                loading={actionLoading}
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
            />
        </div>
    );
};

export default TripDetails;
