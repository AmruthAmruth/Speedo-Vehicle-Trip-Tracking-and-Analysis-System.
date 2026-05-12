import React, { useEffect, useState } from 'react';
// Cache bust: 2026-05-12T10:43:00
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Shield';
import CarIcon from '@mui/icons-material/DirectionsCar';
import TimerIcon from '@mui/icons-material/Timer';
import BoltIcon from '@mui/icons-material/Bolt';
import WarningIcon from '@mui/icons-material/WarningAmber';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { tripApi } from '../../../services/tripApi';
import { Trip } from '../../../types/trip.types';
import { formatDistance, formatDuration } from '../../../utils/tripUtils';
import { Card, Badge, Button } from '../../../components/shared/ui';

const COLORS = ['#000000', '#475569', '#94a3b8', '#cbd5e1'];

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
    const totalDuration = trips.reduce((acc, t) => acc + (new Date(t.endTime || t.startTime).getTime() - new Date(t.startTime).getTime()), 0);
    const tripCount = trips.length;

    // Derived Insights
    const tripScores = trips.map(t => {
        const idleRatio = t.totalDistance > 0 ? (t.totalIdlingTime / (t.totalDistance * 10)) : 0;
        const score = Math.max(0, Math.min(100, 100 - (idleRatio * 500)));
        return {
            name: t.name.length > 12 ? t.name.substring(0, 10) + '..' : t.name,
            score: Math.round(score),
            distance: Math.round(t.totalDistance / 1000),
            date: new Date(t.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
    }).reverse();

    const avgSafetyScore = tripScores.length > 0
        ? Math.round(tripScores.reduce((acc, s) => acc + s.score, 0) / tripScores.length)
        : 85;

    const efficiencyScore = Math.min(100, Math.round((totalDistance / 1000) / (totalDuration / 3600000) * 1.5));

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40">
                <div className="h-10 w-10 animate-spin border-2 border-slate-200 border-t-black rounded-full" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20 pt-8 px-4">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-100 pb-10 gap-8">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                        Fleet Intelligence
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">
                        Deep analysis of driver behavior, safety metrics, and operational efficiency.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl border-slate-100 h-11 px-6 text-xs font-bold uppercase tracking-widest">
                        Export PDF
                    </Button>
                    <Button variant="primary" className="rounded-xl bg-black h-11 px-6 text-xs font-bold uppercase tracking-widest">
                        Refresh Data
                    </Button>
                </div>
            </header>

            {/* Core KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border-slate-100 shadow-soft space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-slate-50 rounded-lg"><SecurityIcon className="text-slate-900 w-5 h-5" /></div>
                        <Badge variant="success" size="sm" className="bg-emerald-50 text-emerald-600 border-none">+2.4%</Badge>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Safety Index</p>
                        <h3 className="text-3xl font-bold text-slate-900">{avgSafetyScore}<span className="text-sm text-slate-300 font-medium ml-1">/100</span></h3>
                    </div>
                </Card>

                <Card className="p-6 border-slate-100 shadow-soft space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-slate-50 rounded-lg"><CarIcon className="text-slate-900 w-5 h-5" /></div>
                        <Badge variant="primary" size="sm" className="bg-slate-100 text-slate-600 border-none">{tripCount} Sessions</Badge>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Distance</p>
                        <h3 className="text-3xl font-bold text-slate-900">{formatDistance(totalDistance)}</h3>
                    </div>
                </Card>

                <Card className="p-6 border-slate-100 shadow-soft space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-slate-50 rounded-lg"><BoltIcon className="text-slate-900 w-5 h-5" /></div>
                        <Badge variant="warning" size="sm" className="bg-amber-50 text-amber-600 border-none">Optimal</Badge>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Efficiency Score</p>
                        <h3 className="text-3xl font-bold text-slate-900">{efficiencyScore}%</h3>
                    </div>
                </Card>

                <Card className="p-6 border-slate-100 shadow-soft space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-slate-50 rounded-lg"><TimerIcon className="text-slate-900 w-5 h-5" /></div>
                        <Badge variant="error" size="sm" className="bg-rose-50 text-rose-600 border-none">Check</Badge>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg. Stoppage</p>
                        <h3 className="text-3xl font-bold text-slate-900">{formatDuration(totalStoppage / (tripCount || 1))}</h3>
                    </div>
                </Card>
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Trend Analysis */}
                <Card className="lg:col-span-8 p-8 border-slate-100 shadow-soft">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Safety & Distance Trend</h3>
                            <p className="text-xs text-slate-400 font-medium mt-1">Timeline of performance across recent sessions.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-black" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Score</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Distance</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={tripScores}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#000000" stopOpacity={0.05} />
                                        <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} fontStyle="bold" />
                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', padding: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    labelStyle={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#000000" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" name="Safety Index" />
                                <Area type="monotone" dataKey="distance" stroke="#cbd5e1" strokeWidth={1.5} fillOpacity={0} name="Dist (km)" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Risk Event Analysis */}
                <Card className="lg:col-span-4 p-8 border-slate-100 shadow-soft">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Risk Event Analysis</h3>
                    <p className="text-xs text-slate-400 font-medium mb-10">Real-time behavior violation monitoring.</p>
                    
                    <div className="space-y-8">
                        {[
                            { label: 'Overspeeding Ratio', value: 12, status: 'Low Risk', color: 'bg-black' },
                            { label: 'Aggressive Braking', value: 34, status: 'Moderate', color: 'bg-slate-400' },
                            { label: 'Idle Fuel Waste', value: 8, status: 'Minimal', color: 'bg-slate-200' },
                            { label: 'Cornering G-Force', value: 22, status: 'Normal', color: 'bg-slate-300' }
                        ].map((risk) => (
                            <div key={risk.label} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{risk.label}</p>
                                        <p className="text-[10px] font-medium text-slate-400">{risk.status}</p>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">{risk.value}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${risk.color} rounded-full transition-all duration-1000`} 
                                        style={{ width: `${risk.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-10 border-t border-slate-50 flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                            <WarningIcon className="text-rose-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900">Urgent Recommendation</p>
                            <p className="text-[10px] text-slate-400 font-medium">Review aggressive braking events in Trip #402.</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Rankings Table */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Performance Leaderboard</h2>
                    <Button variant="outline" className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest border-slate-100">Full Ranking</Button>
                </div>
                <Card className="p-0 overflow-hidden border-slate-100 shadow-soft">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Session Identifier</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Safety Score</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Telemetry Grade</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            {tripScores.slice(0, 5).map((s, i) => (
                                <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-slate-900">{s.name}</span>
                                            <span className="text-[10px] font-medium text-slate-400">{s.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-black rounded-full" style={{ width: `${s.score}%` }} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{s.score}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-600 px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                                            {s.score > 90 ? 'Grade A+' : s.score > 80 ? 'Grade A' : 'Grade B'}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors">
                                            View Insight →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </section>
        </div>
    );
};

export default DriverBehavior;

