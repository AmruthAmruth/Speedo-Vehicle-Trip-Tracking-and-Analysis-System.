import React from 'react';
import { useNavigate } from 'react-router-dom';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';

interface LiveFleetMonitorProps {
    activeTripsCount: number;
}

const LiveFleetMonitor: React.FC<LiveFleetMonitorProps> = ({ activeTripsCount }) => {
    const navigate = useNavigate();

    if (activeTripsCount === 0) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.4)',
            animation: 'pulse-container 2s infinite'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    padding: '12px', 
                    borderRadius: '12px' 
                }}>
                    <GpsFixedIcon style={{ fontSize: 28 }} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>LIVE FLEET MONITOR</h3>
                    <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                        {activeTripsCount} vehicle{activeTripsCount > 1 ? 's are' : ' is'} currently transmitting GPS data.
                    </p>
                </div>
            </div>
            <button 
                className="btn-secondary" 
                onClick={() => navigate('/dashboard/live')}
                style={{ background: 'white', color: '#EF4444', border: 'none', fontWeight: 800 }}
            >
                Monitor Fleet
            </button>
            <style>{`
                @keyframes pulse-container {
                    0% { box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4); }
                    50% { box-shadow: 0 15px 25px -5px rgba(239, 68, 68, 0.6); }
                    100% { box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4); }
                }
            `}</style>
        </div>
    );
};

export default LiveFleetMonitor;
