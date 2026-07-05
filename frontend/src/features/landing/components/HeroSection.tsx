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
            {/* Subtle Floating Icons */}
            <div className="hero-bg-animation">
                <div className="floating-icon" style={{ animation: 'float 6s ease-in-out infinite' }}>
                    <SpeedIcon style={{ fontSize: '3rem', color: 'rgba(255, 255, 255, 0.08)' }} />
                </div>
                <div className="floating-icon" style={{ animation: 'float 7s ease-in-out infinite', animationDelay: '1s' }}>
                    <TrendingUpIcon style={{ fontSize: '2.5rem', color: 'rgba(255, 255, 255, 0.08)' }} />
                </div>
                <div className="floating-icon" style={{ animation: 'float 8s ease-in-out infinite', animationDelay: '2s' }}>
                    <MapIcon style={{ fontSize: '3.5rem', color: 'rgba(255, 255, 255, 0.08)' }} />
                </div>
            </div>

            <div
                style={{
                    maxWidth: '1100px',
                    textAlign: 'center',
                    color: COLORS.textInverse,
                    zIndex: 1,
                }}
            >
                {/* Headline */}
                <h1
                    style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        lineHeight: '1.2',
                        textShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
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
                    style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                        marginBottom: '3rem',
                        opacity: 0.95,
                        maxWidth: '750px',
                        margin: '0 auto 3rem',
                        lineHeight: '1.6',
                    }}
                >
                    Smart GPS-powered tracking that monitors distance, speed, idling, stoppages, and overspeeding. Gain real-time insights and visualize fleet performance with interactive maps.
                </p>

                {/* CTA Buttons */}
                <div
                    style={{
                        display: 'flex',
                        gap: '1.2rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        marginBottom: '4rem',
                    }}
                >
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: COLORS.textInverse,
                            color: COLORS.primary,
                            border: 'none',
                            padding: '1rem 2.2rem',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
                        }}
                    >
                        Get Started Free
                    </button>
                    <button
                        onClick={() => scrollToSection('features')}
                        style={{
                            background: 'transparent',
                            color: COLORS.textInverse,
                            border: `2px solid ${COLORS.textInverse}`,
                            padding: '1rem 2.2rem',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'background 0.3s ease, color 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = COLORS.textInverse;
                            e.currentTarget.style.color = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = COLORS.textInverse;
                        }}
                    >
                        Explore Features
                    </button>
                </div>

                {/* Feature Highlights */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.8rem',
                        maxWidth: '850px',
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
                            style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(12px)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                transition: 'transform 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
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

            {/* Minimal Floating Animation Keyframes */}
            <style>
                {`
                    @keyframes float {
                        0% { transform: translateY(0); }
                        50% { transform: translateY(-12px); }
                        100% { transform: translateY(0); }
                    }
                `}
            </style>
        </section>
    );
};

export default HeroSection;
