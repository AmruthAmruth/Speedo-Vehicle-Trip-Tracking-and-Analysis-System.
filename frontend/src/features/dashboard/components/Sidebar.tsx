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
        { path: `${APP_ROUTES.DASHBOARD.ROOT}/${APP_ROUTES.DASHBOARD.TRIPS}`, icon: <HistoryIcon />, label: 'History' },
        { path: `${APP_ROUTES.DASHBOARD.ROOT}/${APP_ROUTES.DASHBOARD.DRIVERS}`, icon: <BarChartIcon />, label: 'Analysis' },
        { path: `${APP_ROUTES.DASHBOARD.ROOT}/${APP_ROUTES.DASHBOARD.UPLOAD}`, icon: <UploadFileIcon />, label: 'Upload' },
    ];

    return (
        <aside 
            className={cn(
                "fixed top-0 left-0 z-40 h-screen transition-all duration-200 border-r border-black bg-white flex flex-col",
                isOpen ? "w-64" : "w-20"
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-4 px-6 py-12 border-b border-black mb-6">
                <div className="bg-black p-2">
                    <SpeedIcon className="text-white" />
                </div>
                {isOpen && (
                    <span className="text-xl font-black uppercase tracking-tighter">
                        Speedo
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-grow px-2 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === APP_ROUTES.DASHBOARD.ROOT}
                        className={({ isActive }) => cn(
                            "flex items-center gap-4 px-4 py-4 transition-all group",
                            isActive 
                                ? "bg-black text-white" 
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
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {item.label}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="px-2 pb-6">
                <button 
                    onClick={logout}
                    className={cn(
                        "flex items-center gap-4 px-4 py-6 w-full transition-all group text-slate-400 hover:text-black",
                        !isOpen && "justify-center"
                    )}
                >
                    <ExitToAppIcon />
                    {isOpen && <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>}
                </button>

                {/* Footer */}
                {isOpen && (
                    <div className="mt-4 px-4 border-t border-slate-100 pt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                            v2.0.4 / System Ready
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;


