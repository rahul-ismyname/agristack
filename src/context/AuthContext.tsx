import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: any | null;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    loading: boolean;
    profileLoading: boolean;
    isAdmin: boolean;
    loginAsAdmin: () => void; // Temporary for hardcoded admin
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);

    // Temporary state for hardcoded admin
    const [isHardcodedAdmin, setIsHardcodedAdmin] = useState(false);

    const fetchProfile = async (userId: string) => {
        setProfileLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }
            setProfile(data || null);
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        // Check local storage for fake admin session
        const fakeAdmin = localStorage.getItem('agristack_admin_session');
        if (fakeAdmin === 'true') {
            setIsHardcodedAdmin(true);
            setLoading(false);
            return;
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) fetchProfile(currentUser.id);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) fetchProfile(currentUser.id);
            else {
                setProfile(null);
                setProfileLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        if (isHardcodedAdmin) {
            localStorage.removeItem('agristack_admin_session');
            setIsHardcodedAdmin(false);
            // manually trigger a "refresh" of sorts or just redirect will handle it
            window.location.href = '/login';
            return;
        }
        await supabase.auth.signOut();
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    const loginAsAdmin = () => {
        localStorage.setItem('agristack_admin_session', 'true');
        setIsHardcodedAdmin(true);
        // Force a re-render or state update isn't strictly needed if we navigate immediately
    };

    // Derived state for isAdmin
    // True if hardcoded admin OR if profile has role='admin'
    const isAdmin = isHardcodedAdmin || (profile?.role === 'admin');

    // For hardcoded admin, we mock the user/profile objects so the app doesn't crash
    const effectiveUser = isHardcodedAdmin ? { id: 'admin', email: 'admin@agristack.gov', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() } as User : user;
    const effectiveProfile = isHardcodedAdmin ? { name: 'System Admin', role: 'admin', district: 'All', block: 'All' } : profile;

    const effectiveSession = isHardcodedAdmin ? {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: effectiveUser
    } as Session : session;

    return (
        <AuthContext.Provider value={{
            session: effectiveSession,
            user: effectiveUser,
            profile: effectiveProfile,
            signOut,
            refreshProfile,
            loading,
            profileLoading,
            isAdmin,
            loginAsAdmin
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
