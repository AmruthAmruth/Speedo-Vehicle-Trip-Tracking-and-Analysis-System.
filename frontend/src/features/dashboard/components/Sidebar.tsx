import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_ROUTES } from '../../../constants/routes';
import SpeedIcon from '@mui/icons-material/Speed';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../../../context/AuthContext';
import { cn } from '../../../utils/cn';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const { logout } = useAuth();
    
    const menuItems = [
        { path: APP_ROUTES.DASHBOARD.ROOT, icon: <DashboardIcon />, label: 'Overview' },
        { path: `${APP_ROUTES.DASHBOARD.ROOT}/${APP_ROUTES.DASHBOARD.LIVE_TRACKING}`, icon: <GpsFixedIcon />, label: 'Live Tracking' },
        { path: `${APP_ROUTES.DASHBOARD.ROOT}/${APP_ROUTES.DASHBOARD.TRIPS}`, icon: <HistoryIcon />, label: 'Trip History' },
        { path: `${APP_ROUTES.DASHBOARD.ROOT}/${APP_ROUTES.DASHBOARD.DRIVERS}`, icon: <BarChartIcon />, label: 'Analysis' },
        { path: `${APP_ROUTES.DASHBOARD.ROOT}/${APP_ROUTES.DASHBOARD.UPLOAD}`, icon: <UploadFileIcon />, label: 'Upload Data' },
    ];

    return (
        <aside 
            className={cn(
                "fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r border-slate-100 bg-white shadow-premium flex flex-col",
                isOpen ? "w-64" : "w-20"
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-10">
                <div className="bg-brand-500 p-2 rounded-2xl shadow-glow shadow-brand-500/20">
                    <SpeedIcon className="text-white" />
                </div>
                {isOpen && (
                    <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
                        Speedo
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-grow px-3 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === APP_ROUTES.DASHBOARD.ROOT}
                        className={({ isActive }) => cn(
                            "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden",
                            isActive 
                                ? "bg-brand-50 text-brand-600 shadow-sm" 
                                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <span className={cn(
                                    "transition-colors",
                                    isActive ? "text-brand-500" : "group-hover:text-brand-400"
                                )}>
                                    {item.icon}
                                </span>
                                {isOpen && (
                                    <span className="text-sm font-bold tracking-tight">
                                        {item.label}
                                    </span>
                                )}
                                {isActive && (
                                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-brand-500 rounded-r-full" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="px-3 pb-6">
                <button 
                    onClick={logout}
                    className={cn(
                        "flex items-center gap-4 px-4 py-4 w-full rounded-2xl transition-all group text-slate-400 hover:bg-error-light/10 hover:text-error",
                        !isOpen && "justify-center"
                    )}
                >
                    <ExitToAppIcon />
                    {isOpen && <span className="text-sm font-bold tracking-tight">Logout</span>}
                </button>

                {/* Footer */}
                {isOpen && (
                    <div className="mt-6 px-4">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            © 2026 Speedo Fleet v2.0
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;

