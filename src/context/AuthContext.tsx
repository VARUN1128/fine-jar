import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  isSupabaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_ADMIN_KEY = 'finetrack_local_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to check admin status from email / metadata
  const verifyIsAdmin = (u: User | null) => {
    if (!u) return false;
    const email = u.email?.toLowerCase();
    const role = u.user_metadata?.role || u.app_metadata?.role;
    return email === 'fine@gmail.com' || role === 'admin';
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      // 1. Live Supabase Auth setup
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAdmin(verifyIsAdmin(session?.user ?? null));
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAdmin(verifyIsAdmin(session?.user ?? null));
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // 2. Local fallback session for instant testing if Supabase is not yet configured
      const localAdminSession = localStorage.getItem(LOCAL_ADMIN_KEY);
      if (localAdminSession) {
        try {
          const parsed = JSON.parse(localAdminSession);
          setUser(parsed);
          setIsAdmin(true);
        } catch (e) {
          localStorage.removeItem(LOCAL_ADMIN_KEY);
        }
      }
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }

        const adminStatus = verifyIsAdmin(data.user);
        if (!adminStatus) {
          await supabase.auth.signOut();
          setLoading(false);
          return { success: false, error: 'Unauthorized: This account does not have Admin privileges.' };
        }

        setUser(data.user);
        setSession(data.session);
        setIsAdmin(true);
        setLoading(false);
        return { success: true };
      } catch (err: any) {
        setLoading(false);
        return { success: false, error: err.message || 'Authentication failed' };
      }
    } else {
      // Offline / Local verification for the requested credentials
      if (cleanEmail === 'fine@gmail.com' && password === 'fine@sof.admn') {
        const mockAdminUser: any = {
          id: 'admin-local-001',
          email: 'fine@gmail.com',
          role: 'authenticated',
          user_metadata: { role: 'admin', full_name: 'System Admin' },
          created_at: new Date().toISOString(),
        };
        localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(mockAdminUser));
        setUser(mockAdminUser);
        setIsAdmin(true);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: 'Invalid admin credentials. Please check email and password.' };
      }
    }
  };

  const signOut = async () => {
    setLoading(true);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAdmin,
      loading,
      isSupabaseConfigured,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
