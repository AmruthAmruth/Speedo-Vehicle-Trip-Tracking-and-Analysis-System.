import React from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../../constants/constants';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MapIcon from '@mui/icons-material/Map';

const HeroSection: React.FC = () => {
    const navigate = useNavigate();

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section
            id="hero"
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 50%, ${COLORS.secondary} 100%)`,
                position: 'relative',
                overflow: 'hidden',
                padding: '2rem',
            }}
        >
            {/* Animated Background Elements */}
            <div className="hero-bg-animation">
                <div className="floating-icon icon-1">
                    <SpeedIcon style={{ fontSize: '3rem', color: 'rgba(255, 255, 255, 0.1)' }} />
                </div>
                <div className="floating-icon icon-2">
                    <TrendingUpIcon style={{ fontSize: '2.5rem', color: 'rgba(255, 255, 255, 0.1)' }} />
                </div>
                <div className="floating-icon icon-3">
                    <MapIcon style={{ fontSize: '3.5rem', color: 'rgba(255, 255, 255, 0.1)' }} />
                </div>
            </div>

            <div
                style={{
                    maxWidth: '1200px',
                    textAlign: 'center',
                    color: COLORS.textInverse,
                    zIndex: 1,
                }}
            >
                {/* Main Headline */}
                <h1
                    className="hero-title"
                    style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        lineHeight: '1.2',
                        textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    Track Every Mile,
                    <br />
                    <span
                        style={{
                            background: 'linear-gradient(90deg, #ffffff 0%, #d4d4d8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Optimize Every Trip
                    </span>
                </h1>

                {/* Subheadline */}
                <p
                    className="hero-subtitle"
                    style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                        marginBottom: '3rem',
                        opacity: 0.95,
                        maxWidth: '800px',
                        margin: '0 auto 3rem',
                        lineHeight: '1.6',
                    }}
                >
                    Advanced GPS-based vehicle tracking system that calculates distance, speed, idling time, stoppages, and overspeed behavior. Get real-time insights and visualize your fleet's performance on interactive maps.
                </p>

                {/* CTA Buttons */}
                <div
                    style={{
                        display: 'flex',
                        gap: '1.5rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        marginBottom: '4rem',
                    }}
                >
                    <button
                        onClick={() => navigate('/login')}
                        className="hero-btn-primary"
                        style={{
                            background: COLORS.textInverse,
                            color: COLORS.primary,
                            border: 'none',
                            padding: '1rem 2.5rem',
                            borderRadius: '12px',
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Get Started Free
                    </button>
                    <button
                        onClick={() => scrollToSection('features')}
                        className="hero-btn-secondary"
                        style={{
                            background: 'transparent',
                            color: COLORS.textInverse,
                            border: `2px solid ${COLORS.textInverse}`,
                            padding: '1rem 2.5rem',
                            borderRadius: '12px',
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Explore Features
                    </button>
                </div>

                {/* Feature Highlights */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '2rem',
                        maxWidth: '900px',
                        margin: '0 auto',
                    }}
                >
                    {[
                        { label: 'Real-time Tracking', value: '24/7' },
                        { label: 'GPS Accuracy', value: '99.9%' },
                        { label: 'Data Processing', value: 'Instant' },
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className="hero-stat"
                            style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '2rem',
                                    fontWeight: '800',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                {stat.value}
                            </div>
                            <div style={{ opacity: 0.9, fontSize: '0.95rem' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
