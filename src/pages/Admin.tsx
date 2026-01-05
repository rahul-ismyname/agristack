import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, CheckCircle, Radio, UserX, Send } from 'lucide-react';

export const Admin: React.FC = () => {
    const { isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState<'users' | 'approvals' | 'broadcast'>('users');

    // State for Users Tab
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // State for Approvals Tab
    const [pendingInspections, setPendingInspections] = useState<any[]>([]);
    const [pendingVehicles, setPendingVehicles] = useState<any[]>([]);

    // State for Broadcast Tab
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [sendingBroadcast, setSendingBroadcast] = useState(false);
    const [broadcastSuccess, setBroadcastSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
            fetchPendingItems();
        }
    }, [isAdmin]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false });

        if (data) setUsers(data);
        if (error) console.error("Error fetching users:", error);
        setLoadingUsers(false);
    };

    const fetchPendingItems = async () => {
        const { data: inspections } = await supabase
            .from('seed_inspections')
            .select('*')
            .eq('approval_status', 'pending');

        const { data: vehicles } = await supabase
            .from('gyan_vahan')
            .select('*')
            .eq('approval_status', 'pending');

        if (inspections) setPendingInspections(inspections);
        if (vehicles) setPendingVehicles(vehicles);
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (!error) {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } else {
            console.error("Error changing role:", error);
        }
    };

    const handleApproval = async (table: 'seed_inspections' | 'gyan_vahan', id: string, status: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from(table)
            .update({ approval_status: status })
            .eq('id', id);

        if (!error) {
            if (table === 'seed_inspections') {
                setPendingInspections(pendingInspections.filter(i => i.id !== id));
            } else {
                setPendingVehicles(pendingVehicles.filter(v => v.id !== id));
            }
        } else {
            console.error("Error in approval:", error);
        }
    };
    const sendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingBroadcast(true);
        setError(null);
        setBroadcastSuccess(false);

        const { error: insertError } = await supabase.from('announcements').insert({
            title: broadcastTitle,
            message: broadcastMessage,
            is_active: true
        });

        if (!insertError) {
            setBroadcastTitle('');
            setBroadcastMessage('');
            setBroadcastSuccess(true);
            setTimeout(() => setBroadcastSuccess(false), 3000);
        } else {
            setError(insertError.message || "Failed to send broadcast");
        }
        setSendingBroadcast(false);
    };

    if (!isAdmin) {
        return (
            <Layout title="Access Denied">
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <UserX size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-500 max-w-md">
                        You do not have permission to access the Admin Portal. Please contact your system administrator.
                    </p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Admin Portal">
            <div className="flex gap-6 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-4 px-2 text-sm font-medium flex items-center gap-2 transition-colors relative ${activeTab === 'users' ? 'text-primary-vivid' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Users size={18} /> User Management
                    {activeTab === 'users' && (
                        <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-vivid" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('approvals')}
                    className={`pb-4 px-2 text-sm font-medium flex items-center gap-2 transition-colors relative ${activeTab === 'approvals' ? 'text-primary-vivid' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <CheckCircle size={18} />
                    Approvals
                    {(pendingInspections.length + pendingVehicles.length) > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {pendingInspections.length + pendingVehicles.length}
                        </span>
                    )}
                    {activeTab === 'approvals' && (
                        <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-vivid" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('broadcast')}
                    className={`pb-4 px-2 text-sm font-medium flex items-center gap-2 transition-colors relative ${activeTab === 'broadcast' ? 'text-primary-vivid' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Radio size={18} /> Broadcast
                    {activeTab === 'broadcast' && (
                        <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-vivid" />
                    )}
                </button>
            </div>

            <div className="space-y-6">
                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Location</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50">
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900">{user.name || 'Unknown'}</div>
                                                <div className="text-gray-500 text-xs">{user.mobile || 'No Mobile'}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {user.role || 'Officer'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {user.district}, {user.block}
                                            </td>
                                            <td className="p-4 text-right">
                                                {user.role === 'admin' ? (
                                                    <button
                                                        onClick={() => handleRoleChange(user.id, 'officer')}
                                                        className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                                                    >
                                                        Demote to Officer
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRoleChange(user.id, 'admin')}
                                                        className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-black font-medium transition-all"
                                                    >
                                                        Promote to Admin
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && !loadingUsers && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* APPROVALS TAB */}
                {activeTab === 'approvals' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Seed Inspections Column */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                Pending Seed Inspections
                            </h3>
                            {pendingInspections.length === 0 ? (
                                <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 text-sm">
                                    No pending inspections
                                </div>
                            ) : (
                                pendingInspections.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-semibold text-gray-900">{item.crop} - {item.variety}</div>
                                                <div className="text-xs text-gray-500">by {item.inspector_name}</div>
                                            </div>
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-3 space-y-1">
                                            <p>Farmer: <span className="font-medium">{item.farmer_name}</span></p>
                                            <p>Date: {item.inspection_date}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApproval('seed_inspections', item.id, 'approved')}
                                                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleApproval('seed_inspections', item.id, 'rejected')}
                                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Gyan Vahan Column */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                Pending Gyan Vahan Logs
                            </h3>
                            {pendingVehicles.length === 0 ? (
                                <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 text-sm">
                                    No pending vehicle logs
                                </div>
                            ) : (
                                pendingVehicles.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-semibold text-gray-900">{item.village} Visit</div>
                                                <div className="text-xs text-gray-500">{item.district}, {item.block}</div>
                                            </div>
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-3 space-y-1">
                                            <p>Inspector: <span className="font-medium">{item.inspector_name}</span></p>
                                            <p>Farmers Reached: {item.farmers_count}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApproval('gyan_vahan', item.id, 'approved')}
                                                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleApproval('gyan_vahan', item.id, 'rejected')}
                                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* BROADCAST TAB */}
                {activeTab === 'broadcast' && (
                    <div className="max-w-xl mx-auto">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-primary-vivid/10 rounded-full flex items-center justify-center text-primary-vivid">
                                    <Send size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Send Broadcast Message</h3>
                                    <p className="text-sm text-gray-500">This message will be visible to all users on their dashboard.</p>
                                </div>
                            </div>

                            <form onSubmit={sendBroadcast} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={broadcastTitle}
                                        onChange={(e) => setBroadcastTitle(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-vivid/20 focus:border-primary-vivid outline-none"
                                        placeholder="e.g., System Maintenance Notice"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                                    <textarea
                                        value={broadcastMessage}
                                        onChange={(e) => setBroadcastMessage(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-vivid/20 focus:border-primary-vivid outline-none resize-none"
                                        placeholder="Type your message here..."
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={sendingBroadcast}
                                    className="w-full bg-primary-vivid hover:bg-primary-hover text-black font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
                                >
                                    {sendingBroadcast ? 'Sending...' : <><Send size={18} /> Send Broadcast</>}
                                </button>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">!</div>
                                        {error}
                                    </div>
                                )}

                                {broadcastSuccess && (
                                    <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                        <CheckCircle size={16} /> Broadcast sent successfully!
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};
