import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ClipboardCheck,
    BarChart3,
    Settings,
    Search,
    Bell,
    HelpCircle,
    X,
    LogOut,
    ShieldCheck,
    Menu,
    Loader2,
    User,
    FileText,
    Truck,
    type LucideIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { globalSearch } from '../lib/api';
import type { SearchResult } from '../lib/api';

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    to: string;
    active?: boolean;
    onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, to, active = false, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active
            ? 'bg-[#E8F5E9] text-[#1B5E20]'
            : 'text-gray-600 hover:bg-gray-50'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-[#1B5E20]' : 'text-gray-500'}`} />
        {label}
    </Link>
);

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title = "Dashboard" }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path: string) => location.pathname === path;
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { signOut, profile, isAdmin } = useAuth();

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const results = await globalSearch(searchQuery);
                    setSearchResults(results);
                } catch (error) {
                    console.error('Search error:', error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close search results on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchResultClick = (result: SearchResult) => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchFocused(false);

        if (result.type === 'farmer') {
            navigate('/farmers', { state: { highlightId: result.id } });
        } else if (result.type === 'inspection') {
            navigate('/inspections', { state: { highlightId: result.id } });
        } else {
            navigate('/inspections', { state: { tab: 'gyan', highlightId: result.id } });
        }
    };

    const getSearchIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'farmer': return User;
            case 'inspection': return FileText;
            case 'gyan_vahan': return Truck;
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/login', { replace: true });
        }
    };

    const closeSidebar = () => setIsSidebarOpen(false);

    const navItems = (
        <>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" active={isActive('/dashboard')} onClick={closeSidebar} />
            <SidebarItem icon={Users} label="Farmers" to="/farmers" active={isActive('/farmers')} onClick={closeSidebar} />
            <SidebarItem icon={ClipboardCheck} label="Inspections" to="/inspections" active={isActive('/inspections')} onClick={closeSidebar} />
            <SidebarItem icon={BarChart3} label="Reports" to="/reports" active={isActive('/reports')} onClick={closeSidebar} />
            {isAdmin && (
                <div className="py-2">
                    <SidebarItem icon={ShieldCheck} label="Admin Portal" to="/admin" active={isActive('/admin')} onClick={closeSidebar} />
                </div>
            )}
            <SidebarItem icon={Settings} label="Settings" to="/settings" active={isActive('/settings')} onClick={closeSidebar} />
        </>
    );

    return (
        <div className="flex h-screen bg-[#FAFAFA] font-outfit">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-xl">
                        <div className="w-7 h-7 rounded-full border-[3px] border-primary-vivid border-t-transparent -rotate-45" />
                        Agristack
                    </div>
                    <button onClick={closeSidebar} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {navItems}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <Link to="/profile" onClick={closeSidebar} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm group-hover:bg-orange-200 transition-colors overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                profile?.name ? profile.name.split(' ').map((n: any) => n[0]).join('').slice(0, 2) : 'U'
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-semibold text-gray-900 truncate">{profile?.name || 'User'}</div>
                            <div className="text-xs text-gray-500">View Profile</div>
                        </div>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full mt-2 flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>
            </div>

            {/* Help Modal */}
            {isHelpOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsHelpOpen(false)} />
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg relative z-10 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-vivid/10 rounded-xl flex items-center justify-center">
                                    <HelpCircle className="w-6 h-6 text-primary-vivid" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Help & Support</h3>
                                    <p className="text-xs text-gray-500">How to use Agristack Admin</p>
                                </div>
                            </div>
                            <button onClick={() => setIsHelpOpen(false)} className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-900 transition-colors shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <section>
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary-vivid text-white flex items-center justify-center text-[10px]">1</span>
                                    Farmer Registry
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed pl-8">
                                    Add and manage farmer profiles. Use the search bar to find farmers by name, mobile, or Aadhaar number.
                                </p>
                            </section>
                            <section>
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary-vivid text-white flex items-center justify-center text-[10px]">2</span>
                                    Seed Inspections
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed pl-8">
                                    Record and track seed sowing inspections. View pass/fail trends and approve or reject submissions from the field.
                                </p>
                            </section>
                            <section>
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary-vivid text-white flex items-center justify-center text-[10px]">3</span>
                                    Gyan Vahan
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed pl-8">
                                    Monitor mobile awareness vehicles. Track routes, farmer engagement counts, and field observations.
                                </p>
                            </section>
                            <div className="pt-4 mt-6 border-t border-gray-100">
                                <div className="bg-orange-50 p-4 rounded-xl flex gap-3">
                                    <Bell className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                    <p className="text-xs text-orange-800 leading-normal">
                                        For technical assistance, please contact the central IT desk at <strong>support@agristack.gov.in</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setIsHelpOpen(false)}
                                className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 hover:bg-gray-100 transition-all shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0">
                <div className="p-6">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-xl">
                        <div className="w-7 h-7 rounded-full border-[3px] border-primary-vivid border-t-transparent -rotate-45" />
                        Agristack Admin
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {navItems}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <Link to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm group-hover:bg-orange-200 transition-colors overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                profile?.name ? profile.name.split(' ').map((n: any) => n[0]).join('').slice(0, 2) : 'U'
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-semibold text-gray-900 truncate">{profile?.name || 'User'}</div>
                            <div className="text-xs text-gray-500">View Profile</div>
                        </div>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full mt-2 flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <header className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-10">
                    {/* Mobile: Hamburger + Title */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
                        >
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-base md:text-lg font-bold text-gray-900 truncate">{title}</h1>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Desktop Search */}
                        <div className="relative hidden md:block" ref={searchRef}>
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            {isSearching && (
                                <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                            )}
                            <input
                                type="text"
                                placeholder="Search farmers, inspections..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                className="pl-9 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-vivid/20 w-72 transition-all hover:border-gray-300"
                            />

                            {/* Search Results Dropdown */}
                            {isSearchFocused && (searchResults.length > 0 || searchQuery.length >= 2) && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                                    {searchResults.length > 0 ? (
                                        <div className="max-h-80 overflow-y-auto">
                                            {searchResults.map((result) => {
                                                const Icon = getSearchIcon(result.type);
                                                return (
                                                    <button
                                                        key={`${result.type}-${result.id}`}
                                                        onClick={() => handleSearchResultClick(result)}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-100 last:border-0"
                                                    >
                                                        <div className={`p-2 rounded-lg ${result.type === 'farmer' ? 'bg-blue-50 text-blue-600' :
                                                            result.type === 'inspection' ? 'bg-green-50 text-green-600' :
                                                                'bg-purple-50 text-purple-600'
                                                            }`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 truncate">{result.title}</div>
                                                            <div className="text-xs text-gray-500 truncate">{result.subtitle}</div>
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${result.type === 'farmer' ? 'bg-blue-100 text-blue-700' :
                                                            result.type === 'inspection' ? 'bg-green-100 text-green-700' :
                                                                'bg-purple-100 text-purple-700'
                                                            }`}>
                                                            {result.type.replace('_', ' ')}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                            {isSearching ? 'Searching...' : 'No results found'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Mobile Search Icon */}
                        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full md:hidden">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full relative transition-all active:scale-90">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <button
                            onClick={() => setIsHelpOpen(true)}
                            className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-all active:scale-90"
                        >
                            <HelpCircle className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
