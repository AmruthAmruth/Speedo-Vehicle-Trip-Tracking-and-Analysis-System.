export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export interface RegisterResponse {
    id: string;
    name: string;
    email: string;
}

export interface RegisterDeviceDTO {
    userId: string;
    deviceId: string;
    deviceName: string;
}

export interface DeviceAuthResponse {
    deviceToken: string;
    deviceSecret: string;
}

export interface IAuthService {
    register(data: RegisterDTO): Promise<RegisterResponse>;
    login(data: LoginDTO): Promise<AuthResponse>;
    refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
    
    // New Persistent Device Flow
    generatePairingToken(userId: string): Promise<{ pairingToken: string }>;
    linkDevice(pairingToken: string, deviceId: string, deviceName: string): Promise<DeviceAuthResponse>;
    validateDeviceSecret(deviceId: string, deviceSecret: string): Promise<AuthResponse>;
}
