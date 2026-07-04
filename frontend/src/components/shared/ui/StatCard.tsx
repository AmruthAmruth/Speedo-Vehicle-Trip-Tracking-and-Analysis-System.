import React from 'react';
import { Card } from './Card';
import { cn } from '../../../utils/cn';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isUp: boolean;
    };
    className?: string;
    iconClassName?: string;
    iconColor?: string;
    subValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
    label, 
    value, 
    icon, 
    trend,
    className,
    iconClassName,
    iconColor,
    subValue
}) => {
    return (
        <Card className={cn("p-6 border-slate-50 shadow-premium relative overflow-hidden group", className)}>
            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                        {label}
                    </p>
                    <div className="space-y-1">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                            {value}
                        </h3>
                        {subValue && (
                            <p className="text-xs font-semibold text-slate-400">
                                {subValue}
                            </p>
                        )}
                    </div>
                    
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-[10px] font-black uppercase tracking-wider",
                            trend.isUp ? "text-success-dark" : "text-error"
                        )}>
                            <span>{trend.isUp ? '↑' : '↓'} {trend.value}%</span>
                            <span className="text-slate-300 font-medium">vs last month</span>
                        </div>
                    )}
                </div>
                
                <div 
                    className={cn(
                        "p-4 rounded-2xl transition-all duration-300",
                        iconColor 
                            ? "text-white" 
                            : "bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500",
                        iconClassName
                    )}
                    style={iconColor ? { background: iconColor } : undefined}
                >
                    {icon}
                </div>
            </div>
            
            {/* Subtle Background Accent */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-colors" />
        </Card>
    );
};

export default StatCard;
