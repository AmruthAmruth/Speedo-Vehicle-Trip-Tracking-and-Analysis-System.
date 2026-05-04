import { Routes, Route } from 'react-router-dom';
import LandingPage from './features/landing/pages/LandingPage';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import DashboardLayout from './features/dashboard/layout/DashboardLayout';
import DashboardOverview from './features/dashboard/pages/DashboardOverview';
import TripUpload from './features/dashboard/pages/TripUpload';
import TripList from './features/dashboard/pages/TripList';
import TripDetails from './features/dashboard/pages/TripDetails';
import MobileTracker from './features/dashboard/pages/MobileTracker';
import LiveTracking from './features/dashboard/pages/LiveTracking';
import FleetMap from './features/dashboard/pages/FleetMap';
import DriverBehavior from './features/dashboard/pages/DriverBehavior';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { APP_ROUTES } from './constants/routes';

const App = () => {
  return (
    <>
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
        
        {/* Public Tracking Route (Accessible via QR Code) */}
        <Route path={`dashboard/${APP_ROUTES.DASHBOARD.MOBILE_TRACKER}`} element={<MobileTracker />} />

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