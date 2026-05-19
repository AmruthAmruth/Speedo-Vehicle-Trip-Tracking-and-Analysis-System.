import React from 'react';
import { COLORS } from '../../../constants/constants';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SavingsIcon from '@mui/icons-material/Savings';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import Nature from '@mui/icons-material/Nature';
import AssessmentIcon from '@mui/icons-material/Assessment';

const BenefitsSection: React.FC = () => {
    const benefits = [
        {
            icon: <TrendingUpIcon style={{ fontSize: '2.5rem' }} />,
            title: 'Increase Efficiency',
            description: 'Optimize routes and reduce unnecessary trips with data-driven insights.',
            color: COLORS.chartPrimary,
        },
        {
            icon: <SavingsIcon style={{ fontSize: '2.5rem' }} />,
            title: 'Reduce Costs',
            description: 'Lower fuel consumption by identifying and eliminating idling and inefficient driving.',
            color: COLORS.success,
        },
        {
            icon: <SecurityIcon style={{ fontSize: '2.5rem' }} />,
            title: 'Enhance Safety',
            description: 'Monitor overspeed incidents and promote safer driving practices across your fleet.',
            color: COLORS.overspeed,
        },
        {
            icon: <SpeedIcon style={{ fontSize: '2.5rem' }} />,
            title: 'Real-time Monitoring',
            description: 'Track vehicle movements and performance metrics in real-time, 24/7.',
            color: COLORS.secondary,
        },
        {
            icon: <Nature style={{ fontSize: '2.5rem' }} />,
            title: 'Environmental Impact',
            description: 'Reduce carbon footprint by minimizing idling time and optimizing fuel usage.',
            color: COLORS.normal,
        },
        {
            icon: <AssessmentIcon style={{ fontSize: '2.5rem' }} />,
            title: 'Detailed Analytics',
            description: 'Access comprehensive reports and visualizations for informed decision-making.',
            color: COLORS.info,
        },
    ];

    return (
        <section
            id="benefits"
            style={{
                padding: '6rem 2rem',
                background: COLORS.card,
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
                        Why Choose
                        <span
                            style={{
                                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                marginLeft: '0.5rem',
                            }}
                        >
                            Speedo?
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
                        Transform your fleet management with powerful benefits that drive real business value.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem',
                    }}
                >
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className="benefit-card"
                            style={{
                                background: COLORS.background,
                                padding: '2rem',
                                borderRadius: '16px',
                                border: `2px solid ${COLORS.border}`,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                            }}
                        >
                            <div className="benefit-icon-container">
                                {benefit.icon}
                            </div>
                            <h3
                                style={{
                                    fontSize: '1.375rem',
                                    fontWeight: '700',
                                    color: COLORS.textPrimary,
                                    marginBottom: '0.75rem',
                                }}
                            >
                                {benefit.title}
                            </h3>
                            <p
                                style={{
                                    fontSize: '1rem',
                                    color: COLORS.textSecondary,
                                    lineHeight: '1.6',
                                }}
                            >
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div
                    style={{
                        marginTop: '5rem',
                        padding: '3rem',
                        background: '#ffffff',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '20px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '2rem',
                        textAlign: 'center',
                        color: COLORS.textPrimary,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    }}
                >
                    {[
                        { value: '10,000+', label: 'Trips Tracked' },
                        { value: '500+', label: 'Active Users' },
                        { value: '99.9%', label: 'Uptime' },
                        { value: '24/7', label: 'Support' },
                    ].map((stat, index) => (
                        <div key={index}>
                            <div
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: '800',
                                    color: COLORS.textPrimary,
                                    marginBottom: '0.5rem',
                                }}
                            >
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '1rem', color: COLORS.textSecondary }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;
