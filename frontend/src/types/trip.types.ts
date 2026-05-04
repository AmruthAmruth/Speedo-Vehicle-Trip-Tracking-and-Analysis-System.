export interface Trip {
    _id: string;
    userId: string;
    name: string;
    startTime: string;
    endTime: string;
    totalDistance: number;
    totalIdlingTime: number;
    totalStoppageTime: number;
    isActive?: boolean;
    metadata?: {
        source?: 'simulation' | 'mobile' | 'upload';
        [key: string]: any;
    };
    createdAt: string;
    updatedAt: string;
}

export interface GPSPoint {
    _id: string;
    tripId: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    ignition: boolean;
    speed: number;
    heading?: number;
}

export interface TripUploadResponse {
    message: string;
    tripId: string;
    startTime: string;
    endTime: string;
    gpsPointsProcessed: number;
}

export interface GetTripsResponse {
    trips: Trip[];
    count: number;
}

export interface GetGPSPointsResponse {
    gpsPoints: GPSPoint[];
    count: number;
}

export interface TripStats {
    totalDistance: number;
    totalDuration: number;
    averageSpeed: number;
    maxSpeed: number;
    idlingTime: number;
    stoppageTime: number;
    gpsPointsCount: number;
}
