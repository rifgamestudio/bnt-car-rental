"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// 1. Definimos los estados posibles
export type UserStatus = 'guest' | 'registered' | 'pending' | 'verified' | 'rejected';
// Añadimos los tipos de roles
export type UserRole = 'client' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  status: UserStatus;
  role: UserRole; 
  avatar_url?: string;
  country?: string; 
  preferred_locale?: string;
  id_card_front_url?: string;
  id_card_back_url?: string;
  driving_license_url?: string;
}

interface AuthContextType {
  user: User | null;           
  profile: UserProfile | null; 
  status: UserStatus;          
  role: UserRole;              
  loading: boolean;
  isProfileIncomplete: boolean; 
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    // MEJORA PARA EVITAR PARPADEO: 
    // Solo ponemos loading(true) si es la primera vez (profile es null).
    // Si ya tenemos un profile (ej. al cambiar idioma), no activamos loading 
    // para que la UI mantenga el nombre actual mientras se refresca.
    if (!profile) setLoading(true);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setUser(authUser);
        // Buscamos el perfil en la base de datos
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        if (data) {
          setProfile(data as UserProfile);
        }
      } else {
        // Solo limpiamos si realmente no hay sesión
        if (user || profile) {
          setUser(null);
          setProfile(null);
        }
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = '/'; 
  };

  useEffect(() => {
    refreshProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refreshProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Calculamos el status actual de forma segura
  const currentStatus: UserStatus = profile?.status || 'guest';
  const currentRole: UserRole = profile?.role || 'client'; 

  // LOGICA PARA DETECTAR PERFIL INCOMPLETO
  const isProfileIncomplete = !!user && currentRole !== 'admin' && (!profile || !profile.phone);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,          
      status: currentStatus, 
      role: currentRole, 
      loading, 
      isProfileIncomplete, 
      refreshProfile, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};