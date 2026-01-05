import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    type LucideIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    to: string;
    active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, to, active = false }) => (
    <Link
        to={to}
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
    const isActive = (path: string) => location.pathname === path;
    const [isHelpOpen, setIsHelpOpen] = React.useState(false);
    const { signOut, profile } = useAuth();

    return (
        <div className="flex h-screen bg-[#FAFAFA] font-outfit">

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

            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
                <div className="p-6">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-xl">
                        <div className="w-7 h-7 rounded-full border-[3px] border-primary-vivid border-t-transparent -rotate-45" />
                        Agristack Admin
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" active={isActive('/dashboard')} />
                    <SidebarItem icon={Users} label="Farmers" to="/farmers" active={isActive('/farmers')} />
                    <SidebarItem icon={ClipboardCheck} label="Inspections" to="/inspections" active={isActive('/inspections')} />
                    <SidebarItem icon={BarChart3} label="Reports" to="/reports" active={isActive('/reports')} />
                    <SidebarItem icon={Settings} label="Settings" to="/settings" active={isActive('/settings')} />
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
                        onClick={() => signOut()}
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
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
                    <h1 className="text-lg font-bold text-gray-900">{title}</h1>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-vivid/20 w-64 transition-all hover:border-gray-300"
                            />
                        </div>
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
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
