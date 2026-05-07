import api from './api';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/auth.types';
import { API_ROUTES } from '../constants/api';

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>(API_ROUTES.AUTH.LOGIN, data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await api.post<RegisterResponse>(API_ROUTES.AUTH.REGISTER, data);
        return response.data;
    },

    getPairingToken: async (): Promise<{ pairingToken: string }> => {
        const response = await api.get<{ pairingToken: string }>('/auth/devices/pair');
        return response.data;
    },

    linkDevice: async (data: { pairingToken: string; deviceId: string; deviceName: string }): Promise<{ deviceToken: string; deviceSecret: string }> => {
        const response = await api.post<{ deviceToken: string; deviceSecret: string }>('/auth/devices/link', data);
        return response.data;
    },

    validateDeviceSecret: async (data: { deviceId: string; deviceSecret: string }): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/devices/validate-secret', data);
        return response.data;
    },
};
