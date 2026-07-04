import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import LoadingScreen from './components/shared/LoadingScreen';
import { registerServiceWorker } from './services/backgroundTrackingService';
import { APP_ROUTES } from './constants/routes';

// Lazy-loaded pages — each page becomes its own async chunk
const LandingPage = lazy(() => import('./features/landing/pages/LandingPage'));
const Login = lazy(() => import('./features/auth/pages/Login'));
const Register = lazy(() => import('./features/auth/pages/Register'));
const DashboardLayout = lazy(() => import('./features/dashboard/layout/DashboardLayout'));
const DashboardOverview = lazy(() => import('./features/dashboard/pages/DashboardOverview'));
const TripUpload = lazy(() => import('./features/dashboard/pages/TripUpload'));
const TripList = lazy(() => import('./features/dashboard/pages/TripList'));
const TripDetails = lazy(() => import('./features/dashboard/pages/TripDetails'));
const MobileTracker = lazy(() => import('./features/dashboard/pages/MobileTracker'));
const LiveTracking = lazy(() => import('./features/dashboard/pages/LiveTracking'));
const FleetMap = lazy(() => import('./features/dashboard/pages/FleetMap'));
const DriverBehavior = lazy(() => import('./features/dashboard/pages/DriverBehavior'));

const App = () => {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path={APP_ROUTES.HOME} element={
            <GuestRoute>
              <LandingPage />
            </GuestRoute>
          } />
          <Route path={APP_ROUTES.LOGIN} element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } />
          <Route path={APP_ROUTES.REGISTER} element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          } />

          {/* Public Tracking Routes (Accessible via QR Code) */}
          <Route path="/dashboard/track/p/:token" element={<MobileTracker />} />
          <Route path="/dashboard/track/:id" element={<MobileTracker />} />

          {/* Protected Dashboard Routes */}
          <Route
            path={APP_ROUTES.DASHBOARD.ROOT}
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path={APP_ROUTES.DASHBOARD.UPLOAD} element={<TripUpload />} />
            <Route path={APP_ROUTES.DASHBOARD.TRIPS} element={<TripList />} />
            <Route path={APP_ROUTES.DASHBOARD.TRIP_DETAILS} element={<TripDetails />} />
            <Route path={APP_ROUTES.DASHBOARD.LIVE_TRACKING} element={<LiveTracking />} />
            <Route path={APP_ROUTES.DASHBOARD.FLEET} element={<FleetMap />} />
            <Route path={APP_ROUTES.DASHBOARD.DRIVERS} element={<DriverBehavior />} />
          </Route>
        </Routes>
      </Suspense>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default App;