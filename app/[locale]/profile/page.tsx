"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import IdentityScanner from '@/components/verify/IdentityScanner';
import { supabase } from '@/lib/supabase';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  AlertCircle, 
  Globe, 
  Edit2, 
  Save, 
  X,
  Loader2 
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { user, profile, status, loading, refreshProfile } = useAuth();
  const { locale } = React.use(params);
  const t = useTranslations('Profile');

  // Estados para la edición
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    country: '',
    email: ''
  });

  // Sincronizar el formulario con los datos del perfil cuando cargan
  useEffect(() => {
    if (profile || user) {
      setEditForm({
        full_name: profile?.full_name || user?.user_metadata?.full_name || '',
        phone: profile?.phone || '',
        country: profile?.country || '',
        email: user?.email || ''
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Actualizar tabla Profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          country: editForm.country,
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // 2. Si el email cambió, actualizar en Supabase Auth
      if (editForm.email !== user?.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: editForm.email
        });
        if (authError) throw authError;
        alert("Email update requested. Please check your inbox to confirm.");
      }

      await refreshProfile();
      setIsEditing(false);
    } catch (error: any) {
      alert("Error updating profile: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff5f00]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] text-black">
        <p>Please login to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-black pb-20 font-sans">
      <div className="max-w-[1000px] mx-auto pt-12 px-6">
        
        <h1 className="text-4xl font-black mb-8 uppercase italic tracking-tighter">
          {t('title')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: Tarjeta de Datos con Edición */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative">
              
              {/* Botón de Editar / Cancelar */}
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
              >
                {isEditing ? <X size={18} /> : <Edit2 size={18} />}
              </button>

              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('status_label')}</p>
                  <p className={`font-black uppercase text-sm ${status === 'verified' ? 'text-green-600' : 'text-orange-600'}`}>
                    {status === 'registered' ? t('status_unverified') : status === 'verified' ? t('status_verified') : t('status_pending')}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* CAMPO: NOMBRE */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('name_label')}</p>
                  {isEditing ? (
                    <input 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm font-bold focus:border-black outline-none"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    />
                  ) : (
                    <p className="font-bold text-sm truncate">{profile?.full_name || user.user_metadata?.full_name || t('no_name')}</p>
                  )}
                </div>

                {/* CAMPO: EMAIL */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('email_label')}</p>
                  {isEditing ? (
                    <input 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm font-bold focus:border-black outline-none"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-gray-400" />
                      <p className="font-medium text-sm truncate">{user.email}</p>
                    </div>
                  )}
                </div>

                {/* CAMPO: TELÉFONO */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('phone_label')}</p>
                  {isEditing ? (
                    <input 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm font-bold focus:border-black outline-none"
                      value={editForm.phone}
                      placeholder="+34..."
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-gray-400" />
                      <p className="font-medium text-sm">{profile?.phone || <span className="text-orange-500 italic text-xs">{t('missing_phone')}</span>}</p>
                    </div>
                  )}
                </div>

                {/* CAMPO: PAÍS */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">PAYS</p>
                  {isEditing ? (
                    <input 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm font-bold focus:border-black outline-none"
                      value={editForm.country}
                      placeholder="Maroc, France..."
                      onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Globe size={12} className="text-gray-400" />
                      <p className="font-medium text-sm">{profile?.country || "---"}</p>
                    </div>
                  )}
                </div>

                {/* Botón de Guardar Cambios */}
                {isEditing && (
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-black text-white py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-[#ff5f00] transition-colors"
                  >
                    {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <><Save size={14} /> Sauvegarder</>}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Estado de Verificación - SIN CAMBIOS EN LA LÓGICA */}
          <div className="md:col-span-2">
            {status === 'verified' ? (
              <div className="bg-green-600 text-white p-10 rounded-3xl shadow-xl flex flex-col items-center text-center">
                <ShieldCheck size={64} className="mb-4" />
                <h2 className="text-3xl font-black uppercase italic">{t('verified_title')}</h2>
                <p className="opacity-90 mt-2 max-w-md">
                  {t('verified_desc')}
                </p>
                <button className="mt-8 bg-white text-green-700 px-8 py-3 rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition">
                  {t('btn_book')}
                </button>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-orange-100">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="text-[#ff5f00]" />
                  <h2 className="text-xl font-black uppercase">{t('verify_title')}</h2>
                </div>
                <p className="text-gray-500 text-sm mb-8">
                  {t('verify_desc')}
                </p>
                
                {/* COMPONENTE DE ESCÁNER REPETADO */}
                <IdentityScanner />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}