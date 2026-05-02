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

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        general: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors = {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            general: '',
        };

        // Name validation
        if (!formData.name) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

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

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return !newErrors.name && !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
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
            await register(formData.name, formData.email, formData.password);
            toast.success('Registration successful! Welcome to Speedo.');
            // Redirect to dashboard after successful registration
            navigate(APP_ROUTES.DASHBOARD.ROOT);
        } catch (error: unknown) {
            let errorMessage = 'Registration failed. Please try again.';
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

    const getPasswordStrength = (): { strength: string; colorClass: string } => {
        const password = formData.password;
        if (!password) return { strength: '', colorClass: '' };

        if (password.length < 6) {
            return { strength: 'Weak', colorClass: 'text-accent-rose' };
        } else if (password.length < 10) {
            return { strength: 'Medium', colorClass: 'text-accent-amber' };
        } else {
            return { strength: 'Strong', colorClass: 'text-accent-teal' };
        }
    };

    const passwordStrength = getPasswordStrength();

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

                    <h1>Join Speedo Today!</h1>
                    <p>
                        Create your account and start tracking your vehicle fleet with precision and ease.
                    </p>
                </div>

                {/* Right Side - Register Form */}
                <div className="auth-form-container">
                    <div className="auth-form-card">
                        <div className="auth-form-header">
                            <h2>Create Account</h2>
                            <p>Fill in your details to get started</p>
                        </div>

                        {errors.general && (
                            <div className="p-4 bg-red-50 border border-accent-rose rounded-lg mb-6 text-accent-rose text-sm">
                                {errors.general}
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`form-input ${errors.name ? 'error' : ''}`}
                                    placeholder="John Doe"
                                    disabled={isLoading}
                                />
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>

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
                                    placeholder="Create a strong password"
                                    disabled={isLoading}
                                />
                                {passwordStrength.strength && (
                                    <div className={`text-sm mt-1 ${passwordStrength.colorClass}`}>
                                        Password strength: <strong>{passwordStrength.strength}</strong>
                                    </div>
                                )}
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                    placeholder="Re-enter your password"
                                    disabled={isLoading}
                                />
                                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                            </div>

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <span className="spinner" />
                                        Creating account...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        <div className="auth-switch">
                            Already have an account?
                            <Link to={APP_ROUTES.LOGIN}>Sign in</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
