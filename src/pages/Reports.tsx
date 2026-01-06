import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import {
    getDashboardStats
} from '../lib/api';
import {
    TrendingUp,
    Users,
    FileCheck,
    Truck,
    Download,
    Loader2
} from 'lucide-react';
import { ExportModal } from '../components/ExportModal';

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm ${className}`}>
        {children}
    </div>
);

const ProgressBar = ({ label, value, total, color = "bg-blue-500" }: any) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-500">{value} ({percentage}%)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

export const Reports: React.FC = () => {
    const [stats, setStats] = useState<any>({
        farmerCount: 0,
        inspectionCount: 0,
        passedCount: 0,
        failedCount: 0,
        vehicleCount: 0,
        villagesCovered: 0,
        farmerTrend: 0,
        maleFarmers: 0,
        femaleFarmers: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Layout title="Analytics & Reports">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-primary-vivid animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Analytics & Reports">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Reports</h2>
                    <p className="text-gray-500">Real-time insights from your district database.</p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Seed Inspection Summary */}
                <Card className="col-span-1 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <FileCheck className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900">Seed Inspection Outcomes</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="flex items-center justify-center">
                            <div className="relative w-48 h-48 rounded-full border-[16px] border-gray-100 flex items-center justify-center">
                                {/* Simple CSS Pie Chart representation */}
                                <svg viewBox="0 0 36 36" className="w-full h-full absolute transform -rotate-90">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#10B981" // Green
                                        strokeWidth="4" // Thicker stroke
                                        strokeDasharray={`${stats.inspectionCount > 0 ? (stats.passedCount / stats.inspectionCount) * 100 : 0}, 100`}
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#EF4444" // Red
                                        strokeWidth="4"
                                        // Calculate dash array and offset carefully to prevent full red circle when 0 failed
                                        strokeDasharray={`${stats.inspectionCount > 0 ? (stats.failedCount / stats.inspectionCount) * 100 : 0}, 100`}
                                        strokeDashoffset={`-${stats.inspectionCount > 0 ? (stats.passedCount / stats.inspectionCount) * 100 : 0}`}
                                    />
                                </svg>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-900">{stats.inspectionCount}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-6">
                            <ProgressBar
                                label="Passed Inspections"
                                value={stats.passedCount}
                                total={stats.inspectionCount}
                                color="bg-green-500"
                            />
                            <ProgressBar
                                label="Failed Inspections"
                                value={stats.failedCount}
                                total={stats.inspectionCount}
                                color="bg-red-500"
                            />
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Pass Rate</span>
                                    <span className="font-bold text-gray-900">
                                        {stats.inspectionCount > 0 ? Math.round((stats.passedCount / stats.inspectionCount) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Key Metrics */}
                <div className="space-y-6">
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-900">Farmer Registration</h3>
                        </div>
                        <div className="mt-2">
                            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.farmerCount}</div>
                            <div className="text-sm text-green-600 flex items-center gap-1 font-medium">
                                <TrendingUp className="w-4 h-4" />
                                +{stats.farmerTrend}% this month
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            {/* Real Gender Breakdown */}
                            <div className="text-sm flex justify-between">
                                <span className="text-gray-500">Male</span>
                                <span className="font-medium">{stats.maleFarmers} ({stats.farmerCount > 0 ? Math.round((stats.maleFarmers / stats.farmerCount) * 100) : 0}%)</span>
                            </div>
                            <div className="text-sm flex justify-between">
                                <span className="text-gray-500">Female</span>
                                <span className="font-medium">{stats.femaleFarmers} ({stats.farmerCount > 0 ? Math.round((stats.femaleFarmers / stats.farmerCount) * 100) : 0}%)</span>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <Truck className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-900">Gyan Vahan Status</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div className="text-2xl font-bold text-gray-900">{stats.vehicleCount}</div>
                                <div className="text-xs text-gray-500">Active Units</div>
                            </div>
                            <div className="w-px h-10 bg-gray-100"></div>
                            <div className="flex-1">
                                <div className="text-2xl font-bold text-gray-900">{stats.villagesCovered}</div>
                                <div className="text-xs text-gray-500">Villages Covered</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
            />
        </Layout>
    );
};
