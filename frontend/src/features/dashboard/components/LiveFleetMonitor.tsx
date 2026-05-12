import React from 'react';
import { useNavigate } from 'react-router-dom';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { Button, Card } from '../../../components/shared/ui';

interface LiveFleetMonitorProps {
    activeTripsCount: number;
}

const LiveFleetMonitor: React.FC<LiveFleetMonitorProps> = ({ activeTripsCount }) => {
    const navigate = useNavigate();

    if (activeTripsCount === 0) return null;

    return (
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-error-dark to-error p-8 text-white shadow-xl shadow-error/20 animate-pulse-subtle">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <GpsFixedIcon sx={{ fontSize: 120 }} />
            </div>
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                        <GpsFixedIcon sx={{ fontSize: 32 }} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            <h3 className="text-xl font-black tracking-tight uppercase">Live Fleet Monitor</h3>
                        </div>
                        <p className="text-white/80 font-medium max-w-md">
                            <span className="font-bold text-white">{activeTripsCount} vehicle{activeTripsCount > 1 ? 's are' : ' is'}</span> currently transmitting real-time GPS telemetry to the dashboard.
                        </p>
                    </div>
                </div>
                
                <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => navigate('/dashboard/live')}
                    className="bg-white text-error hover:bg-white/90 border-none px-10 font-black shadow-lg"
                >
                    Monitor Fleet
                </Button>
            </div>
        </Card>
    );
};

export default LiveFleetMonitor;

