import React from 'react';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const FleetMap: React.FC = () => {
    return (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ 
                display: 'inline-flex', 
                padding: '24px', 
                background: 'rgba(59, 130, 246, 0.1)', 
                borderRadius: '50%', 
                marginBottom: '24px' 
            }}>
                <LocalShippingIcon style={{ fontSize: 64, color: '#3b82f6' }} />
            </div>
            <h2 className="card-title" style={{ fontSize: '28px', marginBottom: '12px' }}>Fleet Map Overview</h2>
            <p className="card-subtitle" style={{ maxWidth: '600px', margin: '0 auto 32px' }}>
                A high-level geographical view of your entire vehicle fleet. 
                Analyze route density, coverage areas, and optimize deployment.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <span style={{ 
                    padding: '8px 16px', 
                    background: '#DBEAFE', 
                    color: '#3b82f6', 
                    borderRadius: '20px', 
                    fontSize: '14px', 
                    fontWeight: 600 
                }}>
                    Development in Progress
                </span>
            </div>
        </div>
    );
};

export default FleetMap;
