"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl'; // Importamos el hook de traducción

// Definimos los idiomas permitidos (útil si necesitas lógica específica por idioma)
type Locale = 'en' | 'fr' | 'nl';

export default function ForgotPasswordPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializamos las traducciones
  const t = useTranslations('ForgotPass');

  // En Next.js 15 Client Components, desempaquetamos params con React.use
  const { locale } = React.use(params);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Enviamos el email de recuperación
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Importante: Asegúrate de que esta URL redirija a tu página de actualizar password
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-[#f3f4f6] px-4 text-black">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
        {/* TÍTULO */}
        <h1 className="text-2xl font-black mb-2 tracking-tighter italic uppercase">
          {t('title')}
        </h1>
        
        {sent ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">📧</div>
            <p className="text-sm font-bold text-green-600 uppercase mb-8 tracking-tight leading-tight">
              {t('success_msg')}
            </p>
            <Link 
              href="/auth/login" 
              className="inline-block bg-black text-white px-8 py-4 rounded-xl font-black text-xs uppercase no-underline hover:bg-zinc-800 transition-all"
            >
              {t('btn_back_login')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              {t('desc')}
            </p>
            
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                {t('email_label')}
              </label>
              <input 
                type="email" 
                required
                className="w-full h-12 border border-gray-100 rounded-lg px-4 outline-none focus:border-black text-sm font-medium text-black bg-gray-50/50"
                placeholder={t('placeholder')}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-[10px] font-bold uppercase">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-black text-white rounded-xl font-black text-sm hover:bg-zinc-800 transition-all uppercase shadow-lg active:scale-95"
            >
              {loading ? t('sending') : t('send_link')}
            </button>

            <div className="text-center pt-2">
              <Link href="/auth/login" className="text-[10px] font-bold text-gray-400 hover:text-black uppercase no-underline transition-colors">
                {t('back')}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}