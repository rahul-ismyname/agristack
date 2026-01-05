import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import {
    Sprout,
    Truck,
    Plus,
    Search,
    User,
    MapPin,
    CheckCircle2,
    XCircle,
    Loader2,
    Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative ${active ? 'text-primary-vivid' : 'text-gray-500 hover:text-gray-700'
            }`}
    >
        <Icon className="w-5 h-5" />
        {label}
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-vivid"
            />
        )}
    </button>
);

import { InspectionModal } from '../components/InspectionModal';
import { getSeedInspections, createSeedInspection, updateSeedInspectionStatus, getGyanVahanEntries, createGyanVahanEntry, deleteRecord } from '../lib/api';

const SeedInspectionTab = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inspections, setInspections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Passed' | 'Failed'>('All');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await getSeedInspections();
            setInspections(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (newData: any) => {
        try {
            const saved = await createSeedInspection(newData);
            if (saved) setInspections(prev => [saved, ...prev]);
        } catch (error) {
            console.error(error);
            alert('Failed to save inspection');
        }
    };

    const handleStatusUpdate = async (id: string, is_passed: boolean) => {
        try {
            const updated = await updateSeedInspectionStatus(id, is_passed);
            if (updated) {
                setInspections(prev => prev.map(insp =>
                    insp.id === id ? { ...insp, is_passed: is_passed } : insp
                ));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this inspection?')) return;
        try {
            await deleteRecord('seed_inspections', id);
            setInspections(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('Failed to delete inspection');
        }
    };

    const filteredInspections = inspections.filter(row => {
        const matchesSearch =
            row.lot_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.crop?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'All' ? true :
                statusFilter === 'Passed' ? row.is_passed :
                    !row.is_passed;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Lot, Farmer, Crop..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-vivid/20 w-full sm:w-64 transition-all hover:border-gray-300"
                        />
                    </div>

                    <div className="flex p-1 bg-gray-100 rounded-lg border border-gray-200">
                        {(['All', 'Passed', 'Failed'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${statusFilter === status
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-vivid hover:bg-primary-hover text-black px-4 py-2 rounded-lg text-sm font-bold transition-transform transform active:scale-95 shadow-lg shadow-primary-vivid/20"
                >
                    <Plus className="w-4 h-4" />
                    New Inspection
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] gap-3">
                        <Loader2 className="w-8 h-8 text-primary-vivid animate-spin" />
                        <p className="text-sm text-gray-400 font-medium">Loading records...</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Lot No</th>
                                <th className="px-6 py-4">Farmer</th>
                                <th className="px-6 py-4">Crop / Variety</th>
                                <th className="px-6 py-4">Inspector</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Result</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInspections.map((row: any) => (
                                <tr key={row.id} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{row.lot_no}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs ring-4 ring-white shadow-sm">
                                                {row.farmer_name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{row.farmer_name || 'Unknown'}</div>
                                                <div className="text-[10px] text-gray-400 font-mono mb-1">{row.farmer_id}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    {row.village ? `${row.village}, ${row.block}, ${row.district}` : 'Location N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{row.crop}</div>
                                        <div className="text-xs text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1 border border-gray-200">{row.variety}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <div className="font-medium text-gray-900">{row.inspector_name}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">{row.officer_mobile}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2 font-medium">
                                            {new Date(row.inspection_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {row.is_passed ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                                <XCircle className="w-3.5 h-3.5" /> Failed
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative group/actions">
                                            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                                <div className="flex gap-1">
                                                    <div className="w-1 h-1 bg-current rounded-full" />
                                                    <div className="w-1 h-1 bg-current rounded-full" />
                                                    <div className="w-1 h-1 bg-current rounded-full" />
                                                </div>
                                            </button>

                                            {/* Dropdown Menu - Changed to Click instead of Hover for better Mobile/Tablet support if needed, but keeping hover with improved z-index */}
                                            <div className="absolute right-0 top-full pt-2 w-36 hidden group-hover/actions:block z-50">
                                                <div className="bg-white rounded-lg shadow-xl border border-gray-100 py-1 overflow-hidden">
                                                    {!row.is_passed && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(row.id, true)}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 transition-colors"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" /> Approve
                                                        </button>
                                                    )}
                                                    {row.is_passed && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(row.id, false)}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2 transition-colors"
                                                        >
                                                            <XCircle className="w-4 h-4" /> Reject
                                                        </button>
                                                    )}
                                                    <div className="h-px bg-gray-100 my-1" />
                                                    <button
                                                        onClick={() => handleDelete(row.id)}
                                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredInspections.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <Search className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <h3 className="text-gray-900 font-bold text-lg mb-1">No inspections found</h3>
                                            <p className="text-gray-500 text-sm">
                                                We couldn't find any results matching your search terms or filters. Try adjusting them.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <InspectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
};

import { GyanVahanModal } from '../components/GyanVahanModal';

const GyanVahanTab = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await getGyanVahanEntries();
            setVehicles(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (newData: any) => {
        try {
            const saved = await createGyanVahanEntry(newData);
            if (saved) setVehicles(prev => [saved, ...prev]);
        } catch (error) {
            console.error(error);
            alert('Failed to save entry');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this Gyan Vahan entry?')) return;
        try {
            await deleteRecord('gyan_vahan', id);
            setVehicles(prev => prev.filter(v => v.id !== id));
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('Failed to delete entry');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-vivid hover:bg-primary-hover text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Knowledge Unit
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-3 flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-primary-vivid animate-spin" />
                    </div>
                ) : (
                    <>
                        {vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group">
                                <button
                                    onClick={() => handleDelete(vehicle.id)}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Entry"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{vehicle.inspector_name}</div>
                                            <div className="text-xs text-gray-500">{vehicle.inspector_role || 'Inspector'}</div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-50 text-green-700 mr-8">
                                        Active
                                    </span>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</span>
                                        <span className="font-medium text-gray-900 truncate max-w-[120px]">{vehicle.village || vehicle.district}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-2"><User className="w-4 h-4" /> Farmers</span>
                                        <span className="font-medium text-gray-900">{vehicle.farmers_count}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="text-xs text-gray-500 mb-1">Remarks</div>
                                    <div className="font-medium text-sm text-gray-900 truncate">{vehicle.remarks || 'No remarks'}</div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
            {!isLoading && vehicles.length === 0 && (
                <div className="text-center py-12 text-gray-500">No Gyan Vahan entries yet.</div>
            )}

            <GyanVahanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
};

import { useLocation } from 'react-router-dom';

export const Inspections: React.FC = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'seed' | 'gyan'>((location.state as any)?.tab || 'seed');

    return (
        <Layout title="Inspections & Field Operations">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
                <TabButton
                    active={activeTab === 'seed'}
                    onClick={() => setActiveTab('seed')}
                    icon={Sprout}
                    label="Seed Inspection"
                />
                <TabButton
                    active={activeTab === 'gyan'}
                    onClick={() => setActiveTab('gyan')}
                    icon={Truck}
                    label="Gyan Vahan"
                />
            </div>

            {/* Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'seed' ? <SeedInspectionTab /> : <GyanVahanTab />}
            </motion.div>

        </Layout>
    );
};
