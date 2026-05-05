import React, { useEffect, useState } from 'react';
import {
    TrendingUp as TrendingUpIcon,
    Security as SecurityIcon,
    DirectionsCar as CarIcon,
    LocalGasStation as GasIcon,
    Co2 as Co2Icon
} from '@mui/icons-material';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { tripApi } from '../../../services/tripApi';
import { Trip } from '../../../types/trip.types';
import { formatDistance } from '../../../utils/tripUtils';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const DriverBehavior: React.FC = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await tripApi.getUserTrips();
                setTrips(response.trips);
            } catch (err) {
                console.error("Failed to fetch trips for analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrips();
    }, []);

    // Calculate aggregate metrics
    const totalDistance = trips.reduce((acc, t) => acc + (t.totalDistance || 0), 0);
    const totalIdling = trips.reduce((acc, t) => acc + (t.totalIdlingTime || 0), 0);
    const totalStoppage = trips.reduce((acc, t) => acc + (t.totalStoppageTime || 0), 0);
    const tripCount = trips.length;

    // Mock scores for now (calculated based on idling ratio)
    const tripScores = trips.map(t => {
        const idleRatio = t.totalDistance > 0 ? (t.totalIdlingTime / (t.totalDistance * 10)) : 0; // arbitrary ratio
        const score = Math.max(0, Math.min(100, 100 - (idleRatio * 500)));
        return {
            name: t.name.length > 15 ? t.name.substring(0, 12) + '...' : t.name,
            score: Math.round(score),
            distance: Math.round(t.totalDistance / 1000),
            date: new Date(t.startTime).toLocaleDateString()
        };
    }).reverse();

    const avgSafetyScore = tripScores.length > 0
        ? Math.round(tripScores.reduce((acc, s) => acc + s.score, 0) / tripScores.length)
        : 85;

    const activityData = [
        { name: 'Driving', value: totalDistance > 0 ? 70 : 0 },
        { name: 'Idling', value: totalIdling },
        { name: 'Stoppage', value: totalStoppage },
    ].filter(d => d.value > 0);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="analysis-container" style={{ paddingBottom: '40px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Fleet Analytics & Intelligence</h2>
                <p style={{ color: '#64748b', fontSize: '16px', marginTop: '4px' }}>Deep dive into your driving performance and safety metrics</p>
            </div>

            {/* Top Insights Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #6366f1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Avg. Safety Score</p>
                            <h3 style={{ margin: '8px 0', fontSize: '32px', fontWeight: 800, color: '#1e293b' }}>{avgSafetyScore} <span style={{ fontSize: '16px', color: '#64748b' }}>/ 100</span></h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '13px', fontWeight: 700 }}>
                                <TrendingUpIcon style={{ fontSize: 16 }} />
                                <span>+2.4% vs last month</span>
                            </div>
                        </div>
                        <div style={{ padding: '12px', background: '#eef2ff', borderRadius: '12px' }}>
                            <SecurityIcon style={{ color: '#6366f1' }} />
                        </div>
                    </div>
                </div>

                <div className="dashboard-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Total Fleet Distance</p>
                            <h3 style={{ margin: '8px 0', fontSize: '32px', fontWeight: 800, color: '#1e293b' }}>{formatDistance(totalDistance)}</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Across {tripCount} recorded trips</p>
                        </div>
                        <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '12px' }}>
                            <CarIcon style={{ color: '#10b981' }} />
                        </div>
                    </div>
                </div>

                <div className="dashboard-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Estimated Fuel Cost</p>
                            <h3 style={{ margin: '8px 0', fontSize: '32px', fontWeight: 800, color: '#1e293b' }}>${(totalDistance * 0.00012).toFixed(2)}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '13px' }}>
                                <GasIcon style={{ fontSize: 16 }} />
                                <span>Based on $3.50/gal avg</span>
                            </div>
                        </div>
                        <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '12px' }}>
                            <GasIcon style={{ color: '#f59e0b' }} />
                        </div>
                    </div>
                </div>

                <div className="dashboard-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Carbon Footprint</p>
                            <h3 style={{ margin: '8px 0', fontSize: '32px', fontWeight: 800, color: '#1e293b' }}>{(totalDistance * 0.0002).toFixed(1)} <span style={{ fontSize: '16px' }}>kg</span></h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '13px' }}>
                                <Co2Icon style={{ fontSize: 16 }} />
                                <span>CO2 Emission Total</span>
                            </div>
                        </div>
                        <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '12px' }}>
                            <Co2Icon style={{ color: '#ef4444' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
                {/* Distance & Score Trend */}
                <div className="dashboard-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: '#334155' }}>Distance & Safety Trend</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={tripScores}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Safety Score" />
                                <Area type="monotone" dataKey="distance" stroke="#10b981" strokeWidth={2} fillOpacity={0} name="Distance (km)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Breakdown */}
                <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: '#334155' }}>Activity Split</h3>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={activityData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {activityData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Risk Factors & Rankings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="dashboard-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: '#334155' }}>Risk Event Analysis</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, color: '#475569', fontSize: '14px' }}>Overspeeding Ratio</span>
                                <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '14px' }}>Low Risk</span>
                            </div>
                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                                <div style={{ height: '100%', width: '15%', background: '#ef4444', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, color: '#475569', fontSize: '14px' }}>Aggressive Acceleration</span>
                                <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '14px' }}>Moderate</span>
                            </div>
                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                                <div style={{ height: '100%', width: '45%', background: '#f59e0b', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, color: '#475569', fontSize: '14px' }}>Fuel Waste (Idling)</span>
                                <span style={{ fontWeight: 700, color: '#10b981', fontSize: '14px' }}>Optimal</span>
                            </div>
                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                                <div style={{ height: '100%', width: '8%', background: '#10b981', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card" style={{ padding: '0' }}>
                    <div style={{ padding: '24px 24px 12px 24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#334155' }}>Recent Trip Rankings</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Trip</th>
                                    <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Score</th>
                                    <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tripScores.slice(0, 5).map((s, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{s.name}</td>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: s.score > 80 ? '#10b981' : '#f59e0b' }}>{s.score}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                background: s.score > 90 ? '#dcfce7' : s.score > 80 ? '#ecfdf5' : '#fffbeb',
                                                color: s.score > 90 ? '#15803d' : s.score > 80 ? '#10b981' : '#b45309'
                                            }}>
                                                {s.score > 90 ? 'A+' : s.score > 80 ? 'A' : 'B'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverBehavior;
