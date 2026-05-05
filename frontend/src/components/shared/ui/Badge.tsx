import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    color?: 'red' | 'blue' | 'green' | 'yellow' | 'indigo' | 'gray';
    variant?: 'solid' | 'subtle' | 'outline';
    pulse?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ 
    children, 
    color = 'indigo', 
    variant = 'solid',
    pulse = false,
    className = '',
    icon
}) => {
    const colorMaps = {
        red: {
            solid: { bg: '#EF4444', text: 'white', shadow: '0 0 10px rgba(239, 68, 68, 0.4)' },
            subtle: { bg: '#FEE2E2', text: '#B91C1C', shadow: 'none' },
            outline: { bg: 'transparent', text: '#EF4444', border: '1px solid #EF4444' }
        },
        blue: {
            solid: { bg: '#3B82F6', text: 'white', shadow: '0 0 10px rgba(59, 130, 246, 0.4)' },
            subtle: { bg: '#DBEAFE', text: '#1E40AF', shadow: 'none' },
            outline: { bg: 'transparent', text: '#3B82F6', border: '1px solid #3B82F6' }
        },
        green: {
            solid: { bg: '#10B981', text: 'white', shadow: '0 0 10px rgba(16, 185, 129, 0.4)' },
            subtle: { bg: '#D1FAE5', text: '#065F46', shadow: 'none' },
            outline: { bg: 'transparent', text: '#10B981', border: '1px solid #10B981' }
        },
        yellow: {
            solid: { bg: '#F59E0B', text: 'white', shadow: '0 0 10px rgba(245, 158, 11, 0.4)' },
            subtle: { bg: '#FEF3C7', text: '#92400E', shadow: 'none' },
            outline: { bg: 'transparent', text: '#F59E0B', border: '1px solid #F59E0B' }
        },
        indigo: {
            solid: { bg: '#6366F1', text: 'white', shadow: '0 0 10px rgba(99, 102, 241, 0.4)' },
            subtle: { bg: '#EEF2FF', text: '#3730A3', shadow: 'none' },
            outline: { bg: 'transparent', text: '#6366F1', border: '1px solid #6366F1' }
        },
        gray: {
            solid: { bg: '#6B7280', text: 'white', shadow: 'none' },
            subtle: { bg: '#F3F4F6', text: '#374151', shadow: 'none' },
            outline: { bg: 'transparent', text: '#6B7280', border: '1px solid #6B7280' }
        }
    };

    const style = colorMaps[color][variant];

    return (
        <span 
            className={`badge ${pulse ? 'pulse-animation' : ''} ${className}`}
            style={{
                background: style.bg,
                color: style.text,
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: (style as any).shadow,
                border: (style as any).border || 'none',
                textTransform: 'uppercase',
                ...pulse ? { animation: 'pulse-live 2s infinite' } : {}
            }}
        >
            {icon && icon}
            {pulse && !icon && <span style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%' }}></span>}
            {children}
            <style>{`
                @keyframes pulse-live {
                    0% { opacity: 1; }
                    50% { opacity: 0.6; }
                    100% { opacity: 1; }
                }
            `}</style>
        </span>
    );
};

export default Badge;
