import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { COLORS } from '../../../constants/constants';
import { APP_ROUTES } from '../../../constants/routes';
import SpeedIcon from '@mui/icons-material/Speed';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';
import '../styles/auth.css';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });

    const [errors, setErrors] = useState({
        email: '',
        password: '',
        general: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors = {
            email: '',
            password: '',
            general: '',
        };

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return !newErrors.email && !newErrors.password;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors(prev => ({ ...prev, general: '' }));

        try {
            await login(formData.email, formData.password);
            toast.success('Login successful! Welcome back.');
            // Redirect to dashboard or home after successful login
            navigate(APP_ROUTES.DASHBOARD.ROOT);
        } catch (error: unknown) {
            let errorMessage = 'Login failed. Please try again.';
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
            setErrors(prev => ({
                ...prev,
                general: errorMessage,
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg-pattern" />

            {/* Back to Home */}
            <div className="back-to-home">
                <Link to={APP_ROUTES.HOME}>
                    <ArrowBackIcon />
                    <span>Back to Home</span>
                </Link>
            </div>

            <div className="auth-split-container">
                {/* Left Side - Branding */}
                <div className="auth-branding">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">
                            <SpeedIcon style={{ fontSize: '3rem', color: COLORS.textInverse }} />
                        </div>
                        <span className="auth-logo-text">Speedo</span>
                    </div>

                    <h1>Welcome Back!</h1>
                    <p>
                        Sign in to access your vehicle tracking dashboard and monitor your fleet in real-time.
                    </p>
                </div>

                {/* Right Side - Login Form */}
                <div className="auth-form-container">
                    <div className="auth-form-card">
                        <div className="auth-form-header">
                            <h2>Sign In</h2>
                            <p>Enter your credentials to access your account</p>
                        </div>

                        {errors.general && (
                            <div className="p-4 bg-red-50 border border-accent-rose rounded-lg mb-6 text-accent-rose text-sm">
                                {errors.general}
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    placeholder="you@example.com"
                                    disabled={isLoading}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                />
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </div>

                            <div className="form-options">
                                <label className="remember-me">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                    <span>Remember me</span>
                                </label>
                                <a href="#" className="forgot-password">Forgot password?</a>
                            </div>

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <span className="spinner" />
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <div className="auth-switch">
                            Don't have an account?
                            <Link to={APP_ROUTES.REGISTER}>Sign up</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
