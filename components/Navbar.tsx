"use client";

import React from 'react';
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
  
  // Extraemos los estados necesarios
  const { user, profile, status, role, loading } = useAuth();

  const changeLanguage = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    router.refresh();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; 
  };

  // LÓGICA BLINDADA: Evita el parpadeo de email al cambiar de idioma
  const getDisplayName = () => {
    // 1. Si el perfil de la DB está listo, lo mostramos (Prioridad Máxima)
    if (profile?.full_name && profile.full_name.trim() !== "") {
      return profile.full_name;
    }

    // 2. Si estamos cargando O si el usuario existe pero el perfil aún es null,
    // NO bajamos a la opción del email. Mostramos puntos suspensivos o nada.
    // Esto es lo que evita que se vea el email de Samir por un milisegundo.
    if (loading || (user && !profile)) {
      return "...";
    }

    // 3. Prioridad: Metadatos de Google (si existen y no hay perfil en DB)
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }

    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }

    // 4. Última opción: El email (Solo si ya no está cargando y confirmamos que no hay perfil)
    if (user?.email) return user.email;

    return 'MI PERFIL';
  };

  return (
    <nav className="bg-black text-white h-[60px] flex items-center justify-between px-4 md:px-20 sticky top-0 z-[100]">
      {/* Logo sustituido por imagen - RESPETADO */}
      <div className="flex items-center gap-10">
        <Link href="/" className="hover:opacity-80 transition no-underline">
          <img 
            src="/logo.png" 
            alt="BNT Logo" 
            className="h-12 w-auto object-contain" 
          />
        </Link>

        {/* MENÚ PRINCIPAL (ACCUEIL & CONTACT) */}
        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider">
          <Link href="/" className="hover:underline decoration-1 underline-offset-4 text-white no-underline transition-all">
            {t('home') || 'Accueil'}
          </Link>
          <Link href="/contact" className="hover:underline decoration-1 underline-offset-4 text-white no-underline transition-all">
            {t('contact') || 'Contact'}
          </Link>
        </div>
      </div>

      {/* Menú Derecha */}
      <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider">
        
        {role === 'admin' ? (
          <Link href="/admin/users" className="flex items-center gap-2 cursor-pointer text-[#ff5f00] hover:text-white transition-colors no-underline">
            <LayoutDashboard className="w-4 h-4" />
            <span>PANEL ADMIN</span>
          </Link>
        ) : (
          <Link href="/booking" className="flex items-center gap-2 cursor-pointer hover:underline decoration-1 underline-offset-4 text-white no-underline">
            <Car className="w-4 h-4" />
            <span>{t('manage')}</span>
          </Link>
        )}

        {/* Selector de Idioma */}
        <div className="group relative flex items-center gap-2 cursor-pointer py-4">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="uppercase">{locale}</span>
          
          <div className="absolute top-full right-0 bg-white text-black hidden group-hover:block shadow-2xl rounded-md overflow-hidden min-w-[100px] border border-gray-100">
            {['en', 'fr', 'nl'].map((lang) => (
              <div 
                key={lang} 
                onClick={() => changeLanguage(lang as Locale)} 
                className={`px-4 py-3 hover:bg-gray-100 uppercase text-[10px] font-black cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${locale === lang ? 'text-[#ff5f00]' : 'text-black'}`}
              >
                {lang}
              </div>
            ))}
          </div>
        </div>

        {/* Zona de Usuario */}
        {user ? (
          <div className="flex items-center gap-5">
            <Link href="/profile" className="flex items-center gap-2 cursor-pointer hover:underline decoration-1 underline-offset-4 text-white no-underline">
              {/* Círculo de estado */}
              <div className={`w-2 h-2 rounded-full ${status === 'verified' || role === 'admin' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></div>
              
              {/* Nombre con lógica anti-parpadeo */}
              <span className="truncate max-w-[150px] md:max-w-none text-white">
                {getDisplayName()}
              </span>
            </Link>
            
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors" title="Cerrar sesión">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="flex items-center gap-2 cursor-pointer hover:underline decoration-1 underline-offset-4 text-white no-underline">
            <User className="w-4 h-4" />
            <span>{t('login')}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}