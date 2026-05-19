import React from 'react';
import { COLORS } from '../../../constants/constants';
import RouteIcon from '@mui/icons-material/Route';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import WarningIcon from '@mui/icons-material/Warning';
import MapIcon from '@mui/icons-material/Map';

const FeaturesSection: React.FC = () => {
    const features = [
        {
            icon: <RouteIcon style={{ fontSize: '3rem' }} />,
            title: 'Distance Tracking',
            description: 'Accurately calculate total distance traveled using advanced GPS data processing with geolib.',
            color: COLORS.chartPrimary,
        },
        {
            icon: <SpeedIcon style={{ fontSize: '3rem' }} />,
            title: 'Speed Monitoring',
            description: 'Real-time speed calculation and monitoring to ensure safe driving practices.',
            color: COLORS.secondary,
        },
        {
            icon: <LocalParkingIcon style={{ fontSize: '3rem' }} />,
            title: 'Idling Detection',
            description: 'Identify and track vehicle idling time to optimize fuel consumption and reduce emissions.',
            color: COLORS.idle,
        },
        {
            icon: <StopCircleIcon style={{ fontSize: '3rem' }} />,
            title: 'Stoppage Analysis',
            description: 'Monitor all vehicle stops with precise location and duration tracking.',
            color: COLORS.stop,
        },
        {
            icon: <WarningIcon style={{ fontSize: '3rem' }} />,
            title: 'Overspeed Alerts',
            description: 'Instant detection and reporting of overspeed incidents for enhanced safety.',
            color: COLORS.overspeed,
        },
        {
            icon: <MapIcon style={{ fontSize: '3rem' }} />,
            title: 'Interactive Maps',
            description: 'Visualize trips on beautiful Leaflet maps with detailed route information and markers.',
            color: COLORS.normal,
        },
    ];

    return (
        <section
            id="features"
            style={{
                padding: '6rem 2rem',
                background: COLORS.background,
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Section Header */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2
                        className="section-title"
                        style={{
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: '800',
                            color: COLORS.textPrimary,
                            marginBottom: '1rem',
                        }}
                    >
                        Powerful Features for
                        <span
                            style={{
                                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                marginLeft: '0.5rem',
                            }}
                        >
                            Complete Control
                        </span>
                    </h2>
                    <p
                        style={{
                            fontSize: '1.125rem',
                            color: COLORS.textSecondary,
                            maxWidth: '700px',
                            margin: '0 auto',
                            lineHeight: '1.6',
                        }}
                    >
                        Everything you need to track, analyze, and optimize your vehicle fleet performance in one comprehensive platform.
                    </p>
                </div>

                {/* Features Grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '2rem',
                    }}
                >
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card"
                            style={{
                                background: COLORS.card,
                                padding: '2.5rem',
                                borderRadius: '16px',
                                boxShadow: `0 4px 20px ${COLORS.shadow}`,
                                transition: 'all 0.3s ease',
                                border: `1px solid ${COLORS.border}`,
                                cursor: 'pointer',
                            }}
                        >
                            <div className="feature-icon-container">
                                {feature.icon}
                            </div>
                            <h3
                                style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: COLORS.textPrimary,
                                    marginBottom: '1rem',
                                }}
                            >
                                {feature.title}
                            </h3>
                            <p
                                style={{
                                    fontSize: '1rem',
                                    color: COLORS.textSecondary,
                                    lineHeight: '1.6',
                                }}
                            >
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
