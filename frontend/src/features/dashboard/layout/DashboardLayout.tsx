import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Sidebar from '../components/Sidebar';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import '../styles/dashboard.css';

const DashboardLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const getPageTitle = () => {
        if (location.pathname === '/dashboard') return 'Fleet Overview';
        if (location.pathname === '/dashboard/upload') return 'Data Ingestion';
        if (location.pathname === '/dashboard/trips') return 'Operational History';
        if (location.pathname === '/dashboard/drivers') return 'Fleet Intelligence';
        if (location.pathname === '/dashboard/live') return 'Live Fleet Monitor';
        if (location.pathname.startsWith('/dashboard/trips/')) return 'Session Analysis';
        return 'System Console';
    };

    return (
        <div className="flex min-h-screen bg-[#fafafa]">
            <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

            <div className={`flex-grow flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Modern Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-black"
                        >
                            <MenuIcon />
                        </button>
                        <div className="h-6 w-[1px] bg-slate-100" />
                        <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 py-2 pl-2 pr-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white text-xs font-black">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden md:flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-tight text-slate-900 leading-none">
                                    {user?.name}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Administrator
                                </span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleLogout}
                            className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-black hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                            title="Sign Out"
                        >
                            <LogoutIcon sx={{ fontSize: 18 }} />
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="p-8 max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
