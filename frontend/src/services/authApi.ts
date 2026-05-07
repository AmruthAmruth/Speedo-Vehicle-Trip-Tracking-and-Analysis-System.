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

    registerDevice: async (data: { userId: string; deviceId: string; deviceName: string }): Promise<{ deviceToken: string }> => {
        const response = await api.post<{ deviceToken: string }>('/auth/devices/register', data);
        return response.data;
    },

    validateDevice: async (data: { deviceId: string; deviceToken: string }): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/devices/validate', data);
        return response.data;
    },
};
