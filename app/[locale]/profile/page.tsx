"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Edit2, 
  Save, 
  X,
  Loader2,
  Clock,
  Car as CarIcon,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export default function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { locale } = React.use(params);
  const t = useTranslations('Profile');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    country: '',
    email: ''
  });

  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const fetchUserBookings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('bookings')
      .select(`*, cars (*)`)
      .eq('user_id', user.id)
      .in('status', ['pending', 'confirmed']) 
      .order('created_at', { ascending: false });
    
    setActiveBookings(data || []);
    setLoadingBookings(false);
  };

  useEffect(() => {
    if (profile || user) {
      setEditForm({
        full_name: profile?.full_name || user?.user_metadata?.full_name || '',
        phone: profile?.phone || '',
        country: profile?.country || '',
        email: user?.email || ''
      });
      fetchUserBookings();
    }
  }, [profile, user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          country: editForm.country,
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;
      await refreshProfile();
      setIsEditing(false);
    } catch (error: any) {
      console.error(error);
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

  const hasPendingBooking = activeBookings.some(b => b.status === 'pending');

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-black pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto pt-12 px-6">
        
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-black">
            {t('title')}
          </h1>
          <img src="/logo.png" className="h-10 w-auto object-contain" alt="BNT" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden text-black">
              <img src="/logo.png" className="absolute -right-4 -bottom-4 h-24 opacity-[0.03] pointer-events-none -rotate-12" alt="" />
              
              <button onClick={() => setIsEditing(!isEditing)} className="absolute top-6 right-6 text-gray-300 hover:text-black transition-colors z-10">
                {isEditing ? <X size={20} /> : <Edit2 size={20} />}
              </button>

              <div className="flex flex-col mb-8 pb-6 border-b border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t('status_header')}</p>
                <div className="flex items-center gap-3">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${profile?.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      <ShieldCheck size={24}/>
                   </div>
                   <div>
                      <p className={`font-black uppercase text-sm leading-none ${profile?.status === 'verified' ? 'text-green-600' : 'text-orange-600'}`}>
                        {t('status_verified')}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">{t('status_subtitle')}</p>
                   </div>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('name_label')}</label>
                  {isEditing ? (
                    <input className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-black" value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} />
                  ) : (
                    <p className="font-black text-base uppercase italic">{profile?.full_name || user?.user_metadata?.full_name || t('no_name')}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('email_label')}</label>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} />
                    <p className="font-medium text-sm truncate">{user?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('phone_label')}</label>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-zinc-400" />
                    {isEditing ? (
                      <input className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-black" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                    ) : (
                      <p className="font-bold text-sm">{profile?.phone || t('missing_phone')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('country_label')}</label>
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-zinc-400" />
                    {isEditing ? (
                      <input className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-black uppercase" value={editForm.country} onChange={(e) => setEditForm({...editForm, country: e.target.value})} />
                    ) : (
                      <p className="font-bold text-sm uppercase">{profile?.country || "---"}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <button onClick={handleSave} disabled={isSaving} className="w-full bg-black text-white py-4 rounded-2xl font-[1000] uppercase text-xs italic tracking-widest flex items-center justify-center gap-2 hover:bg-[#ff5f00] transition-all shadow-lg mt-6">
                    {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <><Save size={14} /> {t('btn_save')}</>}
                  </button>
                )}
              </div>
            </div>

            {hasPendingBooking && (
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2">
                 <div className="bg-blue-600 text-white p-3 rounded-2xl mb-4 shadow-lg">
                    <Info size={24} />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-900 mb-2">{t('verifying_docs_title')}</h3>
                 <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase opacity-80">
                    {t('verifying_docs_desc')}
                 </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xs font-[1000] text-gray-400 uppercase tracking-[0.3em] mb-4 ml-4">
               {t('active_bookings')} ({activeBookings.length})
            </h2>

            {loadingBookings ? (
               <div className="bg-white p-20 rounded-[2.5rem] flex justify-center"><Loader2 className="animate-spin text-gray-200" /></div>
            ) : activeBookings.length > 0 ? (
              activeBookings.map((booking) => (
                <div key={booking.id} className={`rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col md:flex-row mb-6 border-4 border-white transition-transform hover:scale-[1.01] ${booking.status === 'confirmed' ? 'bg-green-600' : 'bg-zinc-800'}`}>
                  <img src="/logo.png" className="absolute right-6 top-6 h-12 opacity-20 contrast-0 brightness-200" alt="" />
                  
                  <div className="md:w-1/2 bg-white p-8 flex items-center justify-center">
                    <img src={booking.cars?.image_url} className="w-full h-40 object-contain drop-shadow-2xl" alt="Coche" />
                  </div>
                  
                  <div className="md:w-1/2 p-10 text-white flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      {booking.status === 'confirmed' ? <CheckCircle2 size={24} /> : <Clock size={24} className="animate-pulse text-[#ff5f00]" />}
                      <h2 className="text-2xl font-[1000] uppercase italic tracking-tighter">
                        {booking.status === 'confirmed' ? t('status_verified') : t('status_pending')}
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-black uppercase opacity-60 mb-1">{t('car_label')}</p>
                        <p className="text-lg font-black uppercase italic leading-none">{booking.cars?.brand} {booking.cars?.model}</p>
                        <p className="text-[10px] font-bold text-green-200 mt-1 uppercase tracking-widest">{booking.cars?.plate}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                        <div>
                          <p className="text-[8px] font-black uppercase opacity-60 mb-1">{t('pickup_label')}</p>
                          <p className="text-[11px] font-bold uppercase">{booking.pickup_date}</p>
                          <p className="text-[9px] opacity-80 uppercase truncate">{booking.pickup_location}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase opacity-60 mb-1">{t('return_label')}</p>
                          <p className="text-[11px] font-bold uppercase">{booking.return_date}</p>
                          <p className="text-[9px] opacity-80 uppercase truncate">{booking.return_location}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/20 flex justify-between items-end">
                        <div>
                          <p className="text-[8px] font-black uppercase opacity-60">{t('total_label')}</p>
                          <p className="text-2xl font-[1000] tracking-tighter leading-none">{booking.total_price} MAD</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
                 <CarIcon size={48} className="mx-auto text-gray-200 mb-4" />
                 <p className="text-gray-400 font-black uppercase text-xs tracking-widest italic leading-relaxed">
                    {t('no_active_bookings')}
                 </p>
                 <Link href="/" className="mt-8 inline-block bg-black text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest no-underline">
                    {t('btn_book')}
                 </Link>
              </div>
            )}

            {/* CAJA DE SEGURO TRADUCIDA */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 flex items-center justify-between relative overflow-hidden">
                <img src="/logo.png" className="absolute -left-4 -bottom-4 h-16 opacity-[0.02] -rotate-12" alt="" />
                <div className="flex items-center gap-4 relative z-10 text-black">
                  <div className="p-3 bg-gray-50 rounded-2xl text-green-500 font-black">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase italic leading-none">{t('insurance_title')}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{t('insurance_desc')}</p>
                  </div>
                </div>
                <button className="text-[10px] font-black uppercase underline tracking-widest text-gray-400 hover:text-black z-10">
                  {t('btn_details')}
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}