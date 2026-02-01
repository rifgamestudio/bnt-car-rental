"use client";

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from './../navigation'; 
import { User, Car, Globe, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Importamos el contexto
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, status } = useAuth(); // Obtenemos el usuario y su estado (verified, etc)

  const changeLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as any });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-black text-white h-[60px] flex items-center justify-between px-4 md:px-20 sticky top-0 z-[100]">
      {/* Logo BNT */}
      <div className="flex items-center">
        <Link href="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition no-underline text-white">
          BNT
        </Link>
      </div>

      {/* Menú Derecha */}
      <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider">
        
        {/* 1. Gestionar las reservas (Solo visible si está verificado) */}
        <Link href="/bookings" className="flex items-center gap-2 cursor-pointer hover:underline decoration-1 underline-offset-4 text-white no-underline">
          <Car className="w-4 h-4" />
          <span>{t('manage')}</span>
        </Link>

        {/* 2. Idioma */}
        <div className="group relative flex items-center gap-2 cursor-pointer py-4">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="uppercase">{locale}</span>
          
          <div className="absolute top-full right-0 bg-white text-black hidden group-hover:block shadow-2xl rounded-md overflow-hidden min-w-[100px] border border-gray-100">
            {['en', 'fr', 'nl'].map((lang) => (
              <div 
                key={lang} 
                onClick={() => changeLanguage(lang)} 
                className="px-4 py-3 hover:bg-gray-100 uppercase text-[10px] font-black cursor-pointer transition-colors border-b border-gray-50 last:border-0"
              >
                {lang}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Lógica Dinámica: PERFIL o LOGIN */}
        {user ? (
          // SI ESTÁ LOGUEADO: Muestra enlace al Perfil y Logout
          <div className="flex items-center gap-5">
            <Link 
              href="/profile" 
              className="flex items-center gap-2 cursor-pointer hover:underline decoration-1 underline-offset-4 text-white no-underline"
            >
              <div className={`w-2 h-2 rounded-full ${status === 'verified' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></div>
              <span>{user.name || 'MI PERFIL'}</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // SI NO ESTÁ LOGUEADO: Muestra Login original
          <Link 
            href="/auth/login" 
            className="flex items-center gap-2 cursor-pointer hover:underline decoration-1 underline-offset-4 text-white no-underline"
          >
            <User className="w-4 h-4" />
            <span>{t('login')}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}