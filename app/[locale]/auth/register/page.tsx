"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeft, Globe, MessageCircle, Loader2, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: '',
    phone: ''
  });

  // Precargar datos si el usuario ya inició sesión con Google o Email
  useEffect(() => {
    if (user) {
      const names = user.user_metadata?.full_name?.split(' ') || ['', ''];
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Si no hay usuario logueado, primero creamos la cuenta en Supabase Auth
      let currentUserId = user?.id;

      if (!user) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: `${formData.firstName} ${formData.lastName}`.trim() }
          }
        });
        if (signUpError) throw signUpError;
        currentUserId = signUpData.user?.id;
      }

      // 2. Actualizamos el perfil con los datos adicionales
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          country: formData.country,
        })
        .eq('id', currentUserId);

      if (profileError) throw profileError;

      await refreshProfile();
      router.push('/'); 
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black px-6 py-10 font-sans">
      <div className="max-w-md mx-auto">
        <button onClick={() => router.back()} className="mb-6">
          <ChevronLeft size={32} />
        </button>

        <h1 className="text-4xl font-[1000] uppercase tracking-tighter mb-10 italic leading-none text-center">
          {t('create_title')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CAMPO EMAIL: Solo editable si NO hay usuario logueado */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-400 ml-1">{t('email_label')}</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-gray-400" />
              <input 
                required
                type="email"
                disabled={!!user} // Bloqueado si vienes de Google
                className={`w-full h-14 border border-gray-300 rounded-xl pl-12 pr-5 text-sm font-bold outline-none transition-all ${user ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* CAMPO PASSWORD: Solo visible si NO hay usuario logueado */}
          {!user && (
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-400 ml-1">{t('pass_label')}</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-gray-400" />
                <input 
                  required
                  type="password"
                  className="w-full h-14 border border-gray-300 rounded-xl pl-12 pr-5 text-sm font-bold focus:border-black outline-none transition-all bg-white"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-800 ml-1">{t('first_name')}</label>
            <input 
              required
              className="w-full h-14 border border-gray-300 rounded-xl px-5 text-sm font-bold focus:border-black outline-none transition-all bg-white"
              value={formData.firstName}
              onChange={e => setFormData({...formData, firstName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-800 ml-1">{t('last_name')}</label>
            <input 
              required
              className="w-full h-14 border border-gray-300 rounded-xl px-5 text-sm font-bold focus:border-black outline-none transition-all bg-white"
              value={formData.lastName}
              onChange={e => setFormData({...formData, lastName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-800 ml-1">{t('country_label')}</label>
            <div className="relative flex items-center">
              <Globe className="absolute left-4 w-5 h-5 text-gray-400" />
              <input 
                required
                type="text"
                placeholder={t('country_placeholder')}
                className="w-full h-14 border border-gray-300 rounded-xl pl-12 pr-5 text-sm font-bold focus:border-black outline-none transition-all bg-white uppercase"
                value={formData.country}
                onChange={e => setFormData({...formData, country: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-800 ml-1">{t('whatsapp_label')}</label>
            <div className="relative flex items-center">
              <MessageCircle className="absolute left-4 w-5 h-5 text-green-500" />
              <input 
                required
                type="tel"
                placeholder="+34..."
                className="w-full h-14 border border-gray-300 rounded-xl pl-12 pr-5 text-sm font-bold focus:border-black outline-none transition-all bg-white"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 bg-[#ff5f00] text-white rounded-2xl font-[1000] uppercase italic tracking-[0.1em] shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" /> : t('btn_register')}
          </button>
        </form>
      </div>
    </div>
  );
}