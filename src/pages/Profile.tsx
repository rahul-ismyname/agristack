import React, { useEffect, useState, useRef } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Mail, Phone, MapPin, Calendar, Loader2, ShieldCheck, Camera, Save, X, Edit2 } from 'lucide-react';
import { Input } from '../components/ui/Input';

export const Profile: React.FC = () => {
    const { user, profile, refreshProfile, loading: authLoading, profileLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        district: '',
        block: '',
        village: '',
        dob: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Stop loading once auth is done and we've checked for profile
        if (!authLoading && !profileLoading) {
            if (profile) {
                setFormData({
                    name: profile.name || '',
                    mobile: profile.mobile || '',
                    district: profile.district || '',
                    block: profile.block || '',
                    village: profile.village || '',
                    dob: profile.dob || ''
                });
            } else {
                // If no profile exists, open edit mode automatically
                setIsEditing(true);
            }
            setIsLoading(false);
        }
    }, [profile, authLoading, profileLoading]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    name: formData.name,
                    mobile: formData.mobile,
                    district: formData.district,
                    block: formData.block,
                    village: formData.village,
                    dob: formData.dob,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            await refreshProfile();
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            alert('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0 || !user) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${Math.random()}.${fileExt}`;

            // 1. Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Upsert profile table
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString()
                });

            if (updateError) throw updateError;

            await refreshProfile();
            alert('Avatar updated successfully!');
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            alert('Error uploading avatar! Ensure "avatars" bucket is created and public.');
        } finally {
            setUploading(false);
        }
    };

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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-primary-vivid/20 to-primary-hover/10" />
                    <div className="px-8 pb-8 -mt-12">
                        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-primary-vivid flex items-center justify-center text-white text-3xl font-bold">
                                            {profile?.name?.[0] || user?.email?.[0].toUpperCase()}
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 p-2 bg-white rounded-lg shadow-md border border-gray-100 text-gray-600 hover:text-primary-vivid transition-colors"
                                    title="Change Avatar"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            <div className="flex-1 mb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{profile?.name || 'User Profile'}</h1>
                                        <p className="text-gray-500 flex items-center gap-1">
                                            <ShieldCheck className="w-4 h-4 text-green-600" />
                                            Verified District Officer
                                        </p>
                                    </div>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary-vivid text-black rounded-lg text-sm font-bold hover:bg-primary-hover transition-all shadow-sm disabled:opacity-50"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium">Email Address</p>
                                                <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium">Mobile Number</p>
                                                <p className="text-sm font-semibold text-gray-900">{profile?.mobile || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
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
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
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
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <Input
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <Input
                                    label="Mobile Number"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                />
                                <Input
                                    label="Date of Birth"
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                />
                                <Input
                                    label="District"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                />
                                <Input
                                    label="Block"
                                    value={formData.block}
                                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                                />
                                <Input
                                    label="Village"
                                    value={formData.village}
                                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 flex gap-4">
                    <ShieldCheck className="w-6 h-6 text-orange-600 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-orange-900 text-sm">Account Security</h4>
                        <p className="text-xs text-orange-800 leading-relaxed mt-1">
                            Your account is protected with agricultural-grade security.
                            Ensure your mobile number is up to date for account recovery.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
