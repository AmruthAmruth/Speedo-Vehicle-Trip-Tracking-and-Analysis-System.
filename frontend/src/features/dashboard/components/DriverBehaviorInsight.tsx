import React from 'react';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface DriverBehaviorInsightProps {
    insight: {
        score: number;
        breakdown: {
            overspeed: number;
            idling: number;
            harshBraking: number;
            harshBrakingCount: number;
        };
        isPlaceholder: true | false;
    };
    isLive: boolean;
}

const DriverBehaviorInsight: React.FC<DriverBehaviorInsightProps> = ({ insight, isLive }) => {
    const scoreColor = insight.score > 80 ? '#10B981' : insight.score > 50 ? '#F59E0B' : '#EF4444';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
            {/* Score Card */}
            <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '20px' }}>
                    <svg width="160" height="160" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#EDF2F7" strokeWidth="12" />
                        <circle 
                            cx="80" 
                            cy="80" 
                            r="70" 
                            fill="none" 
                            stroke={scoreColor} 
                            strokeWidth="12" 
                            strokeDasharray={2 * Math.PI * 70} 
                            strokeDashoffset={2 * Math.PI * 70 * (1 - insight.score / 100)} 
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s ease-out', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                        />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <h2 style={{ fontSize: '36px', fontWeight: 800, margin: 0, color: '#2D3748' }}>
                            {insight.isPlaceholder ? '--' : insight.score}
                        </h2>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#718096', margin: 0, textTransform: 'uppercase' }}>Score</p>
                    </div>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#2D3748', marginBottom: '8px' }}>
                    {insight.isPlaceholder ? 'Awaiting Data...' : (insight.score > 80 ? 'Excellent Driver' : insight.score > 60 ? 'Good Driver' : 'Risk Detected')}
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
                    {isLive ? 'Real-time performance audit' : 'Overall trip behavioral average'}
                </p>
            </div>

            {/* Breakdown Card */}
            <div className="dashboard-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <SecurityIcon style={{ color: '#4F46E5' }} />
                        Behavioral Breakdown
                    </h3>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#6366F1', background: '#EEF2FF', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                        {isLive ? 'Live Tracking' : 'Trip Average'}
                    </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <BreakdownItem 
                        label="Overspeeding" 
                        icon={<SpeedIcon style={{ fontSize: 18, color: '#EF4444' }} />} 
                        penalty={insight.breakdown.overspeed} 
                        color="#EF4444" 
                        progressMultiplier={2}
                    />
                    <BreakdownItem 
                        label="Excessive Idling" 
                        icon={<PauseCircleIcon style={{ fontSize: 18, color: '#F59E0B' }} />} 
                        penalty={insight.breakdown.idling} 
                        color="#F59E0B" 
                        progressMultiplier={5}
                    />
                    <BreakdownItem 
                        label="Harsh Braking" 
                        icon={<TrendingDownIcon style={{ fontSize: 18, color: '#6366F1' }} />} 
                        penalty={insight.breakdown.harshBraking} 
                        color="#6366F1" 
                        progressMultiplier={4}
                        subtitle={`Detected ${insight.breakdown.harshBrakingCount} events`}
                    />

                    <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: '12px', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <WarningAmberIcon style={{ color: '#10B981' }} />
                        <div>
                            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#065F46', margin: 0 }}>Safety Status</h4>
                            <p style={{ fontSize: '12px', color: '#047857', margin: 0 }}>
                                {insight.score > 80 ? 'Minimal risk profile' : 'Improvement recommended'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface BreakdownItemProps {
    label: string;
    icon: React.ReactNode;
    penalty: number;
    color: string;
    progressMultiplier: number;
    subtitle?: string;
}

const BreakdownItem: React.FC<BreakdownItemProps> = ({ label, icon, penalty, color, progressMultiplier, subtitle }) => (
    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#4A5568', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {icon} {label}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color }}>-{penalty} pts</span>
        </div>
        <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px' }}>
            <div style={{ height: '100%', width: `${Math.min(penalty * progressMultiplier, 100)}%`, background: color, borderRadius: '3px' }} />
        </div>
        {subtitle && <p style={{ fontSize: '11px', color: '#718096', marginTop: '6px' }}>{subtitle}</p>}
    </div>
);

export default DriverBehaviorInsight;
