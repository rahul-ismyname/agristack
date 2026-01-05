import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    TrendingUp,
    Users,
    Truck,
    CheckCircle2,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { getDashboardStats, getRecentActivity } from '../lib/api';
import { supabase } from '../lib/supabase';

const StatCard = ({ icon: Icon, color, label, value, trend, trendUp, to, state }: any) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => to && navigate(to, { state })}
            className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer ${!to && 'cursor-default'}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5 text-gray-700" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </div>
                )}
            </div>
            <div className="text-gray-500 text-sm font-medium mb-1">{label}</div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        'Completed': 'bg-blue-50 text-blue-700 border-blue-100',
        'Passed': 'bg-green-50 text-green-700 border-green-100',
        'Failed': 'bg-red-50 text-red-700 border-red-100',
        'Pending': 'bg-amber-50 text-amber-700 border-amber-100',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
            <span className="w-1.5 h-1.5 rounded-full inline-block mr-2 bg-current opacity-60" />
            {status}
        </span>
    );
};

const DashboardSkeleton = () => (
    <div className="animate-pulse">
        <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2" />
            <div className="h-4 w-96 bg-gray-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-32" />
            ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-64" />
    </div>
);

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>({
        farmerCount: 0,
        inspectionCount: 0,
        passedCount: 0,
        failedCount: 0,
        vehicleCount: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [announcement, setAnnouncement] = useState<any>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [statsData, activityData] = await Promise.all([
                    getDashboardStats(),
                    getRecentActivity()
                ]);
                setStats(statsData);
                setRecentActivity(activityData);

                // Fetch latest announcement
                const { data: announcementData } = await supabase
                    .from('announcements')
                    .select('*')
                    .eq('is_active', true)
                    .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Auto-expire after 24 hours
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (announcementData) {
                    const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
                    if (!dismissed.includes(announcementData.id)) {
                        setAnnouncement(announcementData);
                    }
                }

            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    return (
        <Layout title="Dashboard Overview">
            {isLoading ? (
                <DashboardSkeleton />
            ) : (
                <>
                    {announcement && (
                        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-start gap-4 relative group">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-sm">{announcement.title}</h3>
                                <p className="text-gray-600 text-sm mt-1">{announcement.message}</p>
                            </div>
                            <button
                                onClick={() => {
                                    const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
                                    localStorage.setItem('dismissedAnnouncements', JSON.stringify([...dismissed, announcement.id]));
                                    setAnnouncement(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-white/50 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 12" /></svg>
                            </button>
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, Officer</h2>
                        <p className="text-gray-500">Here's what's happening in your district today.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={Users}
                            color="bg-blue-100"
                            label="Total Farmers"
                            value={stats.farmerCount}
                            trend="+12%"
                            trendUp={true}
                            to="/farmers"
                        />
                        <StatCard
                            icon={FileText}
                            color="bg-orange-100"
                            label="Total Inspections"
                            value={stats.inspectionCount}
                            trend="Active"
                            trendUp={true}
                            to="/inspections"
                        />
                        <StatCard
                            icon={CheckCircle2}
                            color="bg-green-100"
                            label="Inspections Passed"
                            value={stats.passedCount}
                            trendUp={true}
                            to="/inspections"
                        />
                        <StatCard
                            icon={Truck}
                            color="bg-purple-100"
                            label="Active Vehicles"
                            value={stats.vehicleCount}
                            trendUp={true}
                            to="/inspections"
                            state={{ tab: 'gyan' }}
                        />
                    </div>

                    {/* Recent Activity Table */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Recent Activity</h3>
                            <button
                                onClick={() => navigate('/inspections')}
                                className="text-sm text-primary-vivid font-medium hover:underline"
                            >
                                View All
                            </button>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Activity</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentActivity.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{row.title}</div>
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-medium ${row.color}`}>{row.type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(row.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={row.status} />
                                        </td>
                                    </tr>
                                ))}
                                {recentActivity.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No recent activity found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </Layout>
    );
};
