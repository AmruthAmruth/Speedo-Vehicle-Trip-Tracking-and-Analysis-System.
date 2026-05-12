import React from 'react';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import HistoryIcon from '@mui/icons-material/History';

interface QuickActionsProps {
    onStartLiveTracking: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onStartLiveTracking }) => {
    const navigate = useNavigate();

    const actions = [
        {
            label: 'Start Live Tracking',
            icon: <GpsFixedIcon className="w-5 h-5" />,
            onClick: onStartLiveTracking,
            className: 'bg-black text-white hover:bg-zinc-800'
        },
        {
            label: 'Upload Data',
            icon: <UploadFileIcon className="w-5 h-5" />,
            onClick: () => navigate('/dashboard/upload'),
            className: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
        },
        {
            label: 'Trip History',
            icon: <HistoryIcon className="w-5 h-5" />,
            onClick: () => navigate('/dashboard/trips'),
            className: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
        }
    ];

    return (
        <div className="flex flex-wrap items-center gap-4">
            {actions.map((action) => (
                <button
                    key={action.label}
                    onClick={action.onClick}
                    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${action.className}`}
                >
                    {action.icon}
                    {action.label}
                </button>
            ))}
        </div>
    );
};

export default QuickActions;

