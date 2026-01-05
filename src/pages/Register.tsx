import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import loginBg from '../assets/login-bg.png';
import { supabase } from '../lib/supabase';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dob: '',
        mobile: '',
        district: '',
        block: '',
        village: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // 1. Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                emailRedirectTo: `${window.location.origin}/login`,
                data: {
                    full_name: formData.name,
                    mobile: formData.mobile,
                    division: formData.district,
                    block: formData.block,
                    village: formData.village,
                }
            }
        });

        if (authError || !authData.user) {
            setError(authError?.message || 'Registration failed');
            setIsLoading(false);
            return;
        }

        // Check if session exists (Required for RLS)
        if (!authData.session) {
            console.warn('No session returned from SignUp. Likely email confirmation is ON.');
            setError('Account created, but not logged in. Please DISABLE "Confirm Email" in Supabase and DELETE this user to try again.');
            setIsLoading(false);
            return;
        }

        // 2. Insert into profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: authData.user.id,
                    name: formData.name,
                    dob: formData.dob,
                    mobile: formData.mobile,
                    district: formData.district,
                    block: formData.block,
                    village: formData.village,
                }
            ]);

        if (profileError) {
            console.error('Profile creation failed:', profileError);
            setError('Profile Error: ' + profileError.message);
        } else {
            console.log('Registration success');
            navigate('/login');
        }

        setIsLoading(false);
    };

    return (
        <div className="h-screen w-full flex font-outfit overflow-hidden">

            {/* Left Side - Image */}
            <div className="hidden lg:flex w-[45%] h-full relative overflow-hidden bg-gray-900 text-white flex-col justify-end p-12">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(' + loginBg + ')' }}
                />
                <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[2px]" />

                <div className="relative z-10 mb-8 text-center px-4">
                    <h2 className="text-3xl xl:text-4xl font-bold mb-4 leading-tight">
                        Join the Future of <br /> Smart Farming
                    </h2>
                    <p className="text-white/80 text-base xl:text-lg mb-8 max-w-md mx-auto leading-relaxed">
                        Create your account to start monitoring crops and optimizing yields with AI-driven insights.
                    </p>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full lg:w-[55%] h-full flex flex-col items-center justify-center p-6 bg-white overflow-y-auto">
                <div className="w-full max-w-lg space-y-5">

                    {/* Header */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full border-[3px] border-primary-vivid border-t-transparent -rotate-45" />
                            <span className="font-bold text-xl text-gray-900">Agristack</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Create Account</h1>
                        <p className="text-gray-500 text-sm">Enter your details to register as a farmer.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                        <Input
                            label="Full Name"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="bg-white border-gray-200 focus:border-primary-vivid focus:ring-primary-vivid/20 rounded-md py-2"
                        />

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-white border-gray-200 focus:border-primary-vivid focus:ring-primary-vivid/20 rounded-md py-2"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Date of Birth"
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                                className="bg-white border-gray-200 focus:border-primary-vivid focus:ring-primary-vivid/20 rounded-md py-2"
                            />
                            <Input
                                label="Mobile Number"
                                name="mobile"
                                type="tel"
                                placeholder="+91 XXXXX XXXXX"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                                className="bg-white border-gray-200 focus:border-primary-vivid focus:ring-primary-vivid/20 rounded-md py-2"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <Input
                                label="District"
                                name="district"
                                placeholder="District"
                                value={formData.district}
                                onChange={handleChange}
                                required
                                className="bg-white border-gray-200 focus:border-primary-vivid focus:ring-primary-vivid/20 rounded-md py-2"
                            />
                            <Input
                                label="Block"
                                name="block"
                                placeholder="Block"
                                value={formData.block}
                                onChange={handleChange}
                                required
                                className="bg-white border-gray-200 focus:border-primary-vivid focus:ring-primary-vivid/20 rounded-md py-2"
                            />
                            <Input
                                label="Village"
                                name="village"
                                placeholder="Village"
                                value={formData.village}
                                onChange={handleChange}
                                required
                                className="bg-white border-gray-200 focus:border-primary-vivid focus:ring-primary-vivid/20 rounded-md py-2"
                            />
                        </div>

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="bg-white border-gray-200 focus:border-primary-vivid focus:ring-primary-vivid/20 rounded-md py-2"
                        />

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            className="w-full bg-primary-vivid hover:bg-primary-hover text-black font-bold py-3 rounded-md shadow-none transition-colors mt-3 text-sm flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : 'Register'}
                        </motion.button>
                    </form>

                    <div className="mt-4 text-center text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="font-bold text-gray-900 hover:text-primary-vivid">Sign In</Link>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-xs text-gray-400 pt-2">
                        <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-600">Terms of Service</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
