"use client";

import React, { useState } from 'react'; // Añadido useState
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from './../navigation'; 
import { User, Car, Globe, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// Definimos los idiomas válidos
type Locale = 'en' | 'fr' | 'nl';

export default function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  
  // Estado para controlar el desplegable de idioma en móviles
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Extraemos los estados necesarios
  const { user, profile, status, role, loading } = useAuth();

  const changeLanguage = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setIsLangOpen(false); // Cerrar menú tras cambiar
    router.refresh();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; 
  };

  // LÓGICA BLINDADA: Evita el parpadeo de email al cambiar de idioma
  const getDisplayName = () => {
    if (profile?.full_name && profile.full_name.trim() !== "") {
      return profile.full_name;
    }
    if (loading || (user && !profile)) {
      return "...";
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) return user.email;
    return 'MI PERFIL';
  };

  return (
    <nav className="bg-black text-white h-[60px] flex items-center justify-between px-2 md:px-20 sticky top-0 z-[9999]">
      {/* Logo y Menú Principal */}
      <div className="flex items-center gap-2 md:gap-10">
        <Link href="/" className="hover:opacity-80 transition no-underline flex-shrink-0">
          <img 
            src="/logo.png" 
            alt="BNT Logo" 
            className="h-8 md:h-12 w-auto object-contain" 
          />
        </Link>

        {/* MENÚ PRINCIPAL (ACCUEIL & CONTACT) - Asegurado para móvil */}
        <div className="flex items-center gap-3 md:gap-8 text-[9px] md:text-[11px] font-bold uppercase tracking-wider flex-shrink-0">
          <Link href="/" className="hover:underline decoration-1 underline-offset-4 text-white no-underline transition-all">
            {t('home') || 'Accueil'}
          </Link>
          <Link href="/contact" className="hover:underline decoration-1 underline-offset-4 text-white no-underline transition-all">
            {t('contact') || 'Contact'}
          </Link>
        </div>
      </div>

      {/* Menú Derecha */}
      <div className="flex items-center gap-2 md:gap-6 text-[9px] md:text-[11px] font-bold uppercase tracking-wider">
        
        {role === 'admin' ? (
          <Link href="/admin/users" className="flex items-center gap-1 cursor-pointer text-[#ff5f00] hover:text-white transition-colors no-underline">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">ADMIN</span>
          </Link>
        ) : (
          <Link href="/booking" className="flex items-center gap-1 cursor-pointer hover:underline decoration-1 underline-offset-4 text-white no-underline">
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">{t('manage')}</span>
          </Link>
        )}

        {/* Selector de Idioma CORREGIDO para móvil con alta prioridad de capa */}
        <div 
          className="relative flex items-center gap-1 md:gap-2 cursor-pointer py-4"
          onClick={() => setIsLangOpen(!isLangOpen)}
        >
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="uppercase">{locale}</span>
          
          <div className={`absolute top-full right-0 bg-white text-black shadow-2xl rounded-md overflow-hidden min-w-[100px] border border-gray-100 z-[10000] ${isLangOpen ? 'block' : 'hidden'}`}>
            {['en', 'fr', 'nl'].map((lang) => (
              <div 
                key={lang} 
                onClick={(e) => {
                  e.stopPropagation();
                  changeLanguage(lang as Locale);
                }} 
                className={`px-4 py-3 hover:bg-gray-100 uppercase text-[10px] font-black cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${locale === lang ? 'text-[#ff5f00]' : 'text-black'}`}
              >
                {lang}
              </div>
            ))}
          </div>
        </div>

        {/* Zona de Usuario */}
        {user ? (
          <div className="flex items-center gap-2 md:gap-5">
            <Link href="/profile" className="flex items-center gap-1 cursor-pointer hover:underline decoration-1 underline-offset-4 text-white no-underline">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status === 'verified' || role === 'admin' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></div>
              <span className="truncate max-w-[60px] md:max-w-none text-white">
                {getDisplayName()}
              </span>
            </Link>
            
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none p-0" title="Cerrar sesión">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="flex items-center gap-1 cursor-pointer hover:underline decoration-1 underline-offset-4 text-white no-underline">
            <User className="w-4 h-4" />
            <span className="hidden xs:inline">{t('login')}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}