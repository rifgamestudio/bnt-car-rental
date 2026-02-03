"use client";

export const dynamic = 'force-dynamic';
import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Clock, ArrowRight, Loader2 } from 'lucide-react';

function CompleteContent() {
  const t = useTranslations('Complete');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshProfile } = useAuth();
  
  const bookingId = searchParams.get('id');
  const flightNumber = searchParams.get('flight');

  useEffect(() => {
    const finalizeProcess = async () => {
      if (!user || !bookingId) return;

      // 1. Actualizar el estado del perfil a 'pending' para que el Admin lo revise
      await supabase
        .from('profiles')
        .update({ status: 'pending' })
        .eq('id', user.id);

      // 2. Si hay número de vuelo, guardarlo en la reserva
      if (flightNumber) {
        await supabase
          .from('bookings')
          .update({ flight_number: flightNumber })
          .eq('id', bookingId);
      }

      // 3. Refrescar el estado local del usuario
      await refreshProfile();
    };

    finalizeProcess();
  }, [user, bookingId, flightNumber, refreshProfile]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full">
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[3rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          {/* Decoración dorada de fondo */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#d4af37]/10 text-[#d4af37] mb-8 shadow-[0_0_40px_rgba(212,175,55,0.2)]">
              <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>

            <h1 className="text-3xl md:text-4xl font-[1000] italic uppercase tracking-tighter text-white mb-4">
              {t('title')}
            </h1>
            
            <p className="text-[#d4af37] font-black uppercase text-[10px] tracking-[0.3em] mb-8">
              {t('subtitle')}
            </p>

            <div className="bg-black/40 border border-zinc-800 rounded-2xl p-6 mb-10">
              <div className="flex items-center gap-4 text-left text-zinc-400">
                <Clock className="shrink-0 text-[#d4af37]" size={20} />
                <p className="text-xs font-bold leading-relaxed">
                  {t('description')}
                </p>
              </div>
            </div>

            <button 
              onClick={() => router.push('/booking')}
              className="group w-full bg-white text-black py-5 rounded-2xl font-[1000] uppercase text-xs tracking-[0.2em] hover:bg-[#d4af37] hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
            >
              {t('btn_my_bookings')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <p className="text-center text-zinc-600 font-bold uppercase text-[8px] tracking-[0.4em] mt-8">
          BNT Premium Car Rental Morocco
        </p>
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-[#d4af37]">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="font-black uppercase text-[10px] tracking-widest italic">Chargement...</p>
      </div>
    }>
      <CompleteContent />
    </Suspense>
  );
}