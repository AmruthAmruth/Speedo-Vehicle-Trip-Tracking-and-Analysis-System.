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
        { path: APP_ROUTES.DASHBOARD.ROOT, icon: <DashboardIcon sx={{ fontSize: 20 }} />, label: 'Overview' },
        { path: `${APP_ROUTES.DASHBOARD.ROOT}/${APP_ROUTES.DASHBOARD.LIVE_TRACKING}`, icon: <GpsFixedIcon sx={{ fontSize: 20 }} />, label: 'Live Tracking' },
        { path: `${APP_ROUTES.DASHBOARD.ROOT}/${APP_ROUTES.DASHBOARD.TRIPS}`, icon: <HistoryIcon sx={{ fontSize: 20 }} />, label: 'History' },
        { path: `${APP_ROUTES.DASHBOARD.ROOT}/${APP_ROUTES.DASHBOARD.DRIVERS}`, icon: <BarChartIcon sx={{ fontSize: 20 }} />, label: 'Analysis' },
        { path: `${APP_ROUTES.DASHBOARD.ROOT}/${APP_ROUTES.DASHBOARD.UPLOAD}`, icon: <UploadFileIcon sx={{ fontSize: 20 }} />, label: 'Upload' },
    ];

    return (
        <aside 
            className={cn(
                "fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r border-slate-100 bg-white flex flex-col overflow-hidden",
                isOpen ? "w-64 shadow-2xl shadow-slate-100" : "w-20"
            )}
        >
            {/* Logo Area */}
            <div className="flex items-center gap-4 px-6 py-10 mb-6">
                <div className="bg-black p-2.5 rounded-xl shadow-lg shadow-black/10">
                    <SpeedIcon className="text-white" sx={{ fontSize: 22 }} />
                </div>
                {isOpen && (
                    <div className="flex flex-col">
                        <span className="text-lg font-black uppercase tracking-tighter leading-none">
                            Speedo
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Fleet Ops
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-grow px-3 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === APP_ROUTES.DASHBOARD.ROOT}
                        className={({ isActive }) => cn(
                            "flex items-center gap-4 px-4 py-3.5 transition-all duration-200 rounded-2xl group",
                            isActive 
                                ? "bg-black text-white shadow-xl shadow-black/10" 
                                : "text-slate-400 hover:text-black hover:bg-slate-50"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <span className={cn(
                                    "transition-colors",
                                    isActive ? "text-white" : "group-hover:text-black"
                                )}>
                                    {item.icon}
                                </span>
                                {isOpen && (
                                    <span className="text-[11px] font-bold uppercase tracking-[0.15em]">
                                        {item.label}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout Section */}
            <div className="px-3 pb-8 space-y-4">
                <button 
                    onClick={logout}
                    className={cn(
                        "flex items-center gap-4 px-4 py-4 w-full transition-all duration-200 rounded-2xl group text-slate-400 hover:text-rose-600 hover:bg-rose-50",
                        !isOpen && "justify-center"
                    )}
                >
                    <ExitToAppIcon sx={{ fontSize: 20 }} />
                    {isOpen && <span className="text-[11px] font-bold uppercase tracking-[0.15em]">Sign Out</span>}
                </button>

                {/* Footer Insight */}
                {isOpen && (
                    <div className="mx-2 p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">System v2.0</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">
                            Active Monitoring Engaged
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;


