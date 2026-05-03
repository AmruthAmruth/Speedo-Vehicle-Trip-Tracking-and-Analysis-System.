/**
 * Application Navigation Routes
 * Centralized route paths for the frontend application
 */
export const APP_ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: {
        ROOT: '/dashboard',
        UPLOAD: 'upload', // Relative path for nested route
        TRIPS: 'trips',   // Relative path for nested route
        TRIP_DETAILS: 'trips/:id', // Relative path for nested route
        MOBILE_TRACKER: 'track/:id', // Mobile tracking page
        ANALYTICS: 'analytics', // Relative path
        SETTINGS: 'settings', // Relative path
        LIVE_TRACKING: 'live',
        FLEET: 'fleet',
        DRIVERS: 'drivers',
    },
} as const;

/**
 * Absolute Dashboard Routes
 * Helper for navigation links that need absolute paths
 */
export const DASHBOARD_ROUTES = {
    OVERVIEW: '/dashboard',
    UPLOAD: '/dashboard/upload',
    TRIPS: '/dashboard/trips',
    ANALYTICS: '/dashboard/analytics',
    SETTINGS: '/dashboard/settings',
    TRIP_DETAILS: (id: string) => `/dashboard/trips/${id}`,
} as const;
