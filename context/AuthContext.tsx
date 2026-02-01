// context/AuthContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type UserStatus = 'guest' | 'registered' | 'pending' | 'verified';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  phone?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  status: UserStatus;
  isLoading: boolean;
  refreshStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<UserStatus>('guest');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (sessionUser: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

    if (data) {
      setUser({
        id: sessionUser.id,
        name: data.full_name,
        email: sessionUser.email,
        status: data.status,
        phone: data.phone
      });
      setStatus(data.status);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user);
      else setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) fetchProfile(session.user);
      else {
        setUser(null);
        setStatus('guest');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, isLoading, refreshStatus: () => fetchProfile(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};