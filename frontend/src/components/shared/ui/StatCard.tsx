import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    iconColor?: string;
    subValue?: string;
    className?: string;
    style?: React.CSSProperties;
}

const StatCard: React.FC<StatCardProps> = ({ 
    label, 
    value, 
    icon, 
    iconColor, 
    subValue,
    className = '',
    style
}) => {
    return (
        <div className={`stat-card ${className}`} style={style}>
            <div className="stat-icon" style={iconColor ? { background: iconColor } : undefined}>
                {icon}
            </div>
            <div className="stat-content">
                <p className="stat-label">{label}</p>
                <h3 className="stat-value">{value}</h3>
                {subValue && (
                    <p style={{ fontSize: '12px', color: '#718096', margin: '4px 0 0 0' }}>
                        {subValue}
                    </p>
                )}
            </div>
        </div>
    );
};

export default StatCard;
