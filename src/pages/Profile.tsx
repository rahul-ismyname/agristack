import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Mail, Phone, MapPin, Calendar, Loader2, ShieldCheck } from 'lucide-react';

export const Profile: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                setProfile(data);
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (isLoading) {
        return (
            <Layout title="Your Profile">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-primary-vivid animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="My Profile">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-primary-vivid/20 to-primary-hover/10" />
                    <div className="px-8 pb-8 -mt-12">
                        <div className="flex flex-col md:flex-row items-end gap-6 mb-6">
                            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                                <div className="w-full h-full rounded-xl bg-primary-vivid flex items-center justify-center text-white text-3xl font-bold">
                                    {profile?.name?.[0] || user?.email?.[0].toUpperCase()}
                                </div>
                            </div>
                            <div className="flex-1 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">{profile?.name || 'User Profile'}</h1>
                                <p className="text-gray-500 flex items-center gap-1">
                                    <ShieldCheck className="w-4 h-4 text-green-600" />
                                    Verified District Officer
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-vivid/10 group-hover:text-primary-vivid transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium">Email Address</p>
                                            <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-vivid/10 group-hover:text-primary-vivid transition-colors">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium">Mobile Number</p>
                                            <p className="text-sm font-semibold text-gray-900">{profile?.mobile || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-vivid/10 group-hover:text-primary-vivid transition-colors">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium">Date of Birth</p>
                                            <p className="text-sm font-semibold text-gray-900">{profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Assigned Territory</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-vivid/10 group-hover:text-primary-vivid transition-colors">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium">Location Details</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {profile?.village}, {profile?.block}<br />
                                                {profile?.district} District
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button className="text-sm font-bold text-primary-vivid hover:text-primary-hover transition-colors">
                                        Edit Account Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Security Info */}
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 flex gap-4">
                    <ShieldCheck className="w-6 h-6 text-orange-600 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-orange-900 text-sm">Account Security</h4>
                        <p className="text-xs text-orange-800 leading-relaxed mt-1">
                            Your account is protected with agricultural-grade security. Last login was {new Date().toLocaleDateString()}.
                            If you notice any unusual activity, please secure your account.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
