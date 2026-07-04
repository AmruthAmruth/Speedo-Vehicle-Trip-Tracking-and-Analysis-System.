import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import axios from 'axios';
import { authApi } from '../services/authApi';
import { User, AuthContextType } from '../types/auth.types';
import { toast } from 'react-toastify';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user and tokens from localStorage on mount
    useEffect(() => {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedAccessToken && storedUser) {
            try {
                setAccessToken(storedAccessToken);
                setUser(JSON.parse(storedUser));
            } catch {
                // Corrupted storage — clear and start fresh
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await authApi.login({ email, password });

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.user));

            setAccessToken(response.accessToken);
            setUser(response.user);
        } catch (error: unknown) {
            let errorMessage = 'Login failed';
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        try {
            await authApi.register({ name, email, password });
            // After registration, automatically log in
            await login(email, password);
        } catch (error: unknown) {
            let errorMessage = 'Registration failed';
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    }, [login]);

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        setAccessToken(null);
        setUser(null);
        toast.info('Logged out successfully');
    }, []);

    // Memoize context value to prevent consumers from re-rendering on every parent render
    const value: AuthContextType = useMemo(() => ({
        user,
        accessToken,
        isAuthenticated: !!accessToken && !!user,
        isLoading,
        login,
        register,
        logout,
    }), [user, accessToken, isLoading, login, register, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
