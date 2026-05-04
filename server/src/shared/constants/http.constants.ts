 
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
} as const;

 
export const HTTP_MESSAGES = {
     
    AUTH: {
        USER_NOT_AUTHENTICATED: 'User not authenticated',
        AUTHORIZATION_TOKEN_MISSING: 'Authorization token missing',
        INVALID_OR_EXPIRED_TOKEN: 'Invalid or expired token',
        EMAIL_ALREADY_EXISTS: 'Email already exists',
        INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password',
    },

     
    TRIP: {
        NO_FILE_UPLOADED: 'No file uploaded',
        TRIP_UPLOADED_SUCCESSFULLY: 'Trip uploaded successfully',
        CSV_VALIDATION_FAILED: 'CSV validation failed',
        INVALID_FILE_TYPE: 'Invalid file type',
        FAILED_TO_UPLOAD_TRIP: 'Failed to upload trip',
        FAILED_TO_FETCH_TRIPS: 'Failed to fetch trips',
        TRIP_NOT_FOUND: 'Trip not found',
        ACCESS_DENIED: 'Access denied',
        FAILED_TO_FETCH_TRIP: 'Failed to fetch trip',
        FAILED_TO_FETCH_GPS_POINTS: 'Failed to fetch GPS points',
        LIVE_TRIP_STARTED: 'Live trip started successfully',
        LIVE_TRIP_STOPPED: 'Live trip stopped successfully',
        TRIP_DELETED: 'Trip and all associated data deleted successfully',
    },

    SIMULATION: {
        STARTED: 'Simulation started successfully',
        STOPPED: 'Simulation stopped successfully',
        FAILED_TO_START: 'Failed to start simulation',
        FAILED_TO_STOP: 'Failed to stop simulation',
    },

    GPS: {
        INVALID_DATA: 'Invalid GPS point data',
        ACCEPTED: 'GPS point accepted for processing',
    },

     
    GENERIC: {
        TOO_MANY_REQUESTS: 'Too many requests, please try again later',
        INSUFFICIENT_GPS_POINTS: (min: number, found: number) =>
            `Insufficient GPS points. At least ${min} points are required, but only ${found} found.`,
    },
} as const;
