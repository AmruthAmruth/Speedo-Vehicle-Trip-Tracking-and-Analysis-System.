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

export interface IAuthService {
    register(data: RegisterDTO): Promise<RegisterResponse>;
    login(data: LoginDTO): Promise<AuthResponse>;
    refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
    registerDevice(data: RegisterDeviceDTO): Promise<{ deviceToken: string }>;
    validateDeviceToken(deviceId: string, deviceToken: string): Promise<AuthResponse>;
}
