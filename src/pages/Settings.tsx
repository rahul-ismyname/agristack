import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { User, Lock, Globe, Moon, Save } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
    const { profile, user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <Layout title="Settings">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Tabs */}
                <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                    {[
                        { id: 'profile', icon: User, label: 'Profile' },
                        { id: 'preferences', icon: Globe, label: 'Preferences' },
                        { id: 'security', icon: Lock, label: 'Security' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-primary-vivid text-black shadow-md'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">

                    {/* Profile Settings */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-2xl font-bold border-4 border-white shadow-lg overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        getInitials(profile?.name || 'Praveen Kumar')
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{profile?.name || 'Praveen Kumar'}</h3>
                                    <p className="text-sm text-gray-500">District Officer • Bihar Agriculture Dept</p>
                                    <button className="text-xs font-medium text-primary-vivid hover:underline mt-1">Change Avatar</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input label="Full Name" value={profile?.name || 'Praveen Kumar'} disabled />
                                <Input label="Email Address" value={user?.email || ''} disabled />
                                <Input label="Phone Number" value={profile?.mobile || 'Not provided'} disabled />
                                <Input label="Designation" value={profile?.role === 'admin' ? 'System Administrator' : 'District Officer'} disabled />
                            </div>
                        </div>
                    )}

                    {/* Preferences Settings */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-500" /> Language & Region
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Language</label>
                                        <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-vivid/20 focus:border-primary-vivid">
                                            <option>English (India)</option>
                                            <option>Hindi (हिंदी)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                                        <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-vivid/20 focus:border-primary-vivid">
                                            <option>DD/MM/YYYY</option>
                                            <option>MM/DD/YYYY</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Moon className="w-4 h-4 text-purple-500" /> Appearance
                                </h3>
                                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Dark Mode</h4>
                                        <p className="text-xs text-gray-500">Switch between light and dark themes</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-vivid/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-vivid"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-red-500" /> Change Password
                                </h3>
                                <div className="grid grid-cols-1 max-w-md gap-4">
                                    <Input label="Current Password" type="password" placeholder="••••••••" />
                                    <Input label="New Password" type="password" placeholder="••••••••" />
                                    <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end">
                                <button className="flex items-center gap-2 bg-primary-vivid hover:bg-primary-hover text-black px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary-vivid/20 transition-all active:scale-95">
                                    <Save className="w-4 h-4" />
                                    Update Password
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};
