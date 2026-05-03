import React from 'react';
import { NavLink } from 'react-router-dom';
import { COLORS } from '../../../constants/constants';
import { APP_ROUTES } from '../../../constants/routes';
import SpeedIcon from '@mui/icons-material/Speed';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../../../context/AuthContext';

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
        <aside className={`dashboard-sidebar ${isOpen ? 'open' : 'closed'}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <SpeedIcon style={{ fontSize: 32, color: COLORS.primary }} />
                {isOpen && <span className="logo-text">Speedo</span>}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === APP_ROUTES.DASHBOARD.ROOT}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <span className="link-icon">{item.icon}</span>
                        {isOpen && <span className="link-label">{item.label}</span>}
                    </NavLink>
                ))}
                
                {/* Logout Button in Sidebar */}
                <button 
                    onClick={logout}
                    className="sidebar-link logout-link"
                    style={{ 
                        width: '100%', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        marginTop: 'auto',
                        borderLeft: '3px solid transparent'
                    }}
                >
                    <span className="link-icon"><ExitToAppIcon /></span>
                    {isOpen && <span className="link-label">Logout</span>}
                </button>
            </nav>

            {/* Footer */}
            {isOpen && (
                <div className="sidebar-footer">
                    <p className="footer-text">© 2026 Speedo</p>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
