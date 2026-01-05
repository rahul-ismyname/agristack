import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Plus, Search, MoreVertical, Phone, MapPin, Loader2, Trash2 } from 'lucide-react';
import { FarmerRegistrationModal } from '../components/FarmerRegistrationModal';
import { getFarmers, createFarmer, deleteRecord } from '../lib/api';

export const Farmers: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [farmers, setFarmers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadFarmers();
    }, []);

    const loadFarmers = async () => {
        try {
            setIsLoading(true);
            const data = await getFarmers();
            setFarmers(data || []);
        } catch (error) {
            console.error('Error loading farmers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (newData: any) => {
        try {
            const savedFarmer = await createFarmer(newData);
            if (savedFarmer) {
                setFarmers(prev => [savedFarmer, ...prev]);
            }
        } catch (error) {
            console.error('Error creating farmer:', error);
            alert('Failed to save farmer. Please try again.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this farmer? This action cannot be undone.')) return;
        try {
            await deleteRecord('farmers', id);
            setFarmers(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            console.error('Error deleting farmer:', error);
            alert('Failed to delete farmer.');
        }
    };

    const filteredFarmers = farmers.filter(farmer =>
        farmer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.mobile?.includes(searchQuery) ||
        farmer.aadhaar?.includes(searchQuery)
    );

    return (
        <Layout title="Farmer Registry">
            <div className="space-y-6">

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-vivid/20 focus:border-primary-vivid shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary-vivid hover:bg-primary-hover text-black px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary-vivid/20 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Farmer
                    </button>
                </div>

                {/* Farmers Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 text-primary-vivid animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Farmer Name</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Contact</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Location</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredFarmers.map((farmer) => (
                                        <tr key={farmer.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{farmer.full_name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {farmer.mobile}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    {farmer.village}, {farmer.district}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative group/actions">
                                                    <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {/* Action Dropdown */}
                                                    <div className="absolute right-0 top-full pt-2 w-36 hidden group-hover/actions:block z-50">
                                                        <div className="bg-white rounded-lg shadow-xl border border-gray-100 py-1 overflow-hidden">
                                                            <button
                                                                onClick={() => handleDelete(farmer.id)}
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
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!isLoading && filteredFarmers.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            {farmers.length === 0 ? "No farmers registered yet. Add one to get started." : "No farmers found matching your search."}
                        </div>
                    )}
                </div>

                <FarmerRegistrationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            </div>
        </Layout>
    );
};
