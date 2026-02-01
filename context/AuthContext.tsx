"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Definimos los estados posibles del usuario en BNT
export type UserStatus = 'guest' | 'registered' | 'pending' | 'verified';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  status: UserStatus;
  login: (userData: UserProfile) => void;
  logout: () => void;
  updateStatus: (newStatus: UserStatus) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<UserStatus>('guest');
  const [isLoading, setIsLoading] = useState(true);

  // Efecto inicial: Aquí es donde más adelante conectaremos con Supabase
  useEffect(() => {
    const checkUser = async () => {
      // Simulación: Al cargar, verificamos si hay sesión
      // Por ahora lo dejamos como guest
      setIsLoading(false);
    };
    checkUser();
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
    setStatus(userData.status);
  };

  const logout = () => {
    setUser(null);
    setStatus('guest');
  };

  const updateStatus = (newStatus: UserStatus) => {
    setStatus(newStatus);
    if (user) {
      setUser({ ...user, status: newStatus });
    }
  };

  return (
    <AuthContext.Provider value={{ user, status, login, logout, updateStatus, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};