import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_ROUTES } from '../constants/routes';
import LoadingScreen from './shared/LoadingScreen';

interface GuestRouteProps {
    children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (isAuthenticated) {
        return <Navigate to={APP_ROUTES.DASHBOARD.ROOT} replace />;
    }

    return <>{children}</>;
};

export default GuestRoute;
