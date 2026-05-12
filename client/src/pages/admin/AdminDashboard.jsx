import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Users, Activity, Loader2 } from 'lucide-react';
import api from '../../services/api';

const StatCard = ({ title, value, icon, bg, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
            {React.cloneElement(icon, { className: `w-6 h-6 ${color}` })}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalIssues: 0, pendingIssues: 0, resolvedIssues: 0, users: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/issues/stats'); // Backend gives issues stats
                const userRes = await api.get('/users/stats').catch(() => ({ data: { totalUsers: 0 } })); // We will create this
                
                setStats({
                    ...res.data.stats,
                    users: userRes.data.totalUsers || 0
                });
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                <p className="text-sm text-slate-500 mt-1">Platform statistics and recent activity.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    title="Total Complaints" 
                    value={stats.totalIssues} 
                    icon={<AlertCircle />} bg="bg-slate-100" color="text-slate-600" 
                />
                <StatCard 
                    title="Pending Issues" 
                    value={stats.pendingIssues} 
                    icon={<Clock />} bg="bg-amber-50" color="text-amber-600" 
                />
                <StatCard 
                    title="Resolved Issues" 
                    value={stats.resolvedIssues} 
                    icon={<CheckCircle />} bg="bg-brand-50" color="text-brand-600" 
                />
                <StatCard 
                    title="Total Users" 
                    value={stats.users} 
                    icon={<Users />} bg="bg-blue-50" color="text-blue-600" 
                />
            </div>

            {/* Activity Area Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[300px] flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">Analytics Chart</p>
                        <p className="text-xs mt-1">Complaint trends over time will appear here.</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[300px] flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">Recent Activity Feed</p>
                        <p className="text-xs mt-1">Latest reports and status changes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
