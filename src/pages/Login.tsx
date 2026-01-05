import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import loginBg from '../assets/login-bg.png';
import { supabase } from '../lib/supabase';

// Placeholder for Google Icon
const GoogleIcon = () => (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Supabase Auth Login
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            // Success
            console.log('Login success');
            navigate('/dashboard'); // Need to creating dashboard route later
        }
    };

    return (
        <div className="h-screen w-full flex font-outfit overflow-hidden">

            {/* Left Side - Image & Branding */}
            <div className="hidden lg:flex w-[45%] h-full relative overflow-hidden bg-gray-900 text-white flex-col justify-end p-12">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${loginBg})` }}
                />
                <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[2px]" />

                <div className="relative z-10 mb-8 text-center px-4">
                    <h2 className="text-3xl xl:text-4xl font-bold mb-4 leading-tight">
                        Smart Farming for a <br /> Sustainable Future
                    </h2>
                    <p className="text-white/80 text-base xl:text-lg mb-8 max-w-md mx-auto leading-relaxed">
                        Monitor crops, analyze soil data, and manage your resources efficiently with the world's leading agricultural intelligence platform.
                    </p>

                    <div className="flex items-center justify-center gap-4 bg-white/10 backdrop-blur-md py-2 px-5 rounded-full w-fit mx-auto border border-white/10">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white/20 overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="user" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <span className="text-xs xl:text-sm font-medium">Trusted by 10,000+ farmers</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-[55%] h-full flex flex-col items-center justify-center p-6 bg-white overflow-y-auto">
                <div className="w-full max-w-sm xl:max-w-md space-y-6">

                    {/* Logo Header */}
                    <div>
                        <div className="mb-6 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full border-[3px] border-primary-vivid border-t-transparent -rotate-45" />
                            <span className="font-bold text-xl text-gray-900">Agristack</span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back</h1>
                        <p className="text-gray-500 text-sm">Please sign in to access your smart farming dashboard.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white border-gray-200 focus:border-primary-vivid focus:ring-primary-vivid/20 rounded-md py-2.5"
                        />

                        <div className="flex flex-col gap-1 relative">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                                <a href="#" className="text-xs font-bold text-primary-vivid hover:text-primary-hover transition-colors">
                                    Forgot Password?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-vivid/20 focus:border-primary-vivid hover:border-gray-300 transition-all font-outfit"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            className="w-full bg-primary-vivid hover:bg-primary-hover text-black font-bold py-3 rounded-md shadow-none transition-colors mt-2 text-sm flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : 'Log In'}
                        </motion.button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                        <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-400">Or continue with</span></div>
                    </div>

                    <div className="grid grid-cols-1">
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm w-full">
                            <GoogleIcon /> Google
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account? <Link to="/register" className="font-bold text-gray-900 hover:text-primary-vivid">Sign Up</Link>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-xs text-gray-400 pt-4">
                        <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-600">Terms of Service</a>
                        <a href="#" className="hover:text-gray-600">Help</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
