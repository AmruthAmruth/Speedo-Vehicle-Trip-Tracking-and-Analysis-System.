import React from 'react';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';

interface QuickActionsProps {
    onStartLiveTracking: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onStartLiveTracking }) => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-card" style={{ marginBottom: '30px' }}>
            <div className="card-header">
                <h3 className="card-title">Quick Actions</h3>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={() => navigate('/dashboard/upload')}>
                    <UploadFileIcon />
                    Upload New Trip
                </button>
                <button 
                    className="btn-primary" 
                    style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}
                    onClick={onStartLiveTracking}
                >
                    <GpsFixedIcon />
                    Start Live Tracking
                </button>
                <button className="btn-secondary" onClick={() => navigate('/dashboard/trips')}>
                    View All Trips
                </button>
            </div>
        </div>
    );
};

export default QuickActions;
