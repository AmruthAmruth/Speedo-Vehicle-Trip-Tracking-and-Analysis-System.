import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const DriverBehavior: React.FC = () => {
    return (
        <div className="analysis-container">
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>Driver Behavioral Intelligence</h2>
                <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Safety audit and performance metrics for your fleet</p>
            </div>

            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', background: '#e0f2fe', borderRadius: '12px' }}>
                        <TrendingUpIcon style={{ color: '#0ea5e9' }} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Avg. Safety Score</p>
                        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>84/100</h3>
                    </div>
                </div>
                <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', background: '#dcfce7', borderRadius: '12px' }}>
                        <CheckCircleIcon style={{ color: '#10b981' }} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Safe Kilometers</p>
                        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>1,248 km</h3>
                    </div>
                </div>
                <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '12px' }}>
                        <WarningIcon style={{ color: '#ef4444' }} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Risk Events</p>
                        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>12</h3>
                    </div>
                </div>
            </div>

            {/* Risk Audit */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="dashboard-card">
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SecurityIcon style={{ color: '#6366f1' }} />
                        Behavioral Risk Audit
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>Overspeeding Events</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444' }}>8 Critical</span>
                            </div>
                            <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
                                <div style={{ height: '100%', width: '65%', background: '#ef4444', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>Harsh Braking</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>4 Detected</span>
                            </div>
                            <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
                                <div style={{ height: '100%', width: '40%', background: '#f59e0b', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>Idle Efficiency</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>Good (12%)</span>
                            </div>
                            <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
                                <div style={{ height: '100%', width: '12%', background: '#10b981', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card" style={{ background: '#1e293b', color: 'white' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Safety Tip</h3>
                    <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
                        Drivers with consistent speeds between 40-60 km/h show 30% fewer maintenance issues over time.
                    </p>
                    <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>Current Rating</p>
                        <h4 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 700 }}>Tier 1 (Safe)</h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverBehavior;

