"use client";

import React, { useState, Suspense } from 'react'; // Añadido Suspense por seguridad de build
import { useSearchParams } from 'next/navigation';
import { Globe, Home, ChevronRight, ShieldCheck, CreditCard, FileText, Plane } from 'lucide-react';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';

function VerifyContent() {
  const t = useTranslations('Verify');
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  const [origin, setOrigin] = useState<'maroc' | 'etranger' | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* CABECERA PASO A PASO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d4af37]/10 text-[#d4af37] mb-6 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter text-white">
            {t('title_1')} <span className="text-[#d4af37]">{t('title_2')}</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
            {t('step_label')}
          </p>
        </div>

        {/* SELECTOR DE ORIGEN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* OPCIÓN MARRUECOS */}
          <button 
            onClick={() => setOrigin('maroc')}
            className={`p-8 rounded-[2rem] border-2 transition-all text-left group flex flex-col ${
              origin === 'maroc' ? 'border-[#d4af37] bg-[#d4af37]/5' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
              origin === 'maroc' ? 'bg-[#d4af37] text-black' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'
            }`}>
              <Home size={24} />
            </div>
            <h3 className="text-white font-black uppercase italic text-xl">{t('maroc_label')}</h3>
            <p className="text-zinc-500 text-xs mt-2 font-bold uppercase leading-relaxed">
              {t('maroc_desc')}
            </p>
            <div className={`mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
               origin === 'maroc' ? 'text-[#d4af37]' : 'text-zinc-600'
            }`}>
              {t('btn_select')} <ChevronRight size={14} />
            </div>
          </button>

          {/* OPCIÓN EXTRANJERO */}
          <button 
            onClick={() => setOrigin('etranger')}
            className={`p-8 rounded-[2rem] border-2 transition-all text-left group flex flex-col ${
              origin === 'etranger' ? 'border-[#d4af37] bg-[#d4af37]/5' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
              origin === 'etranger' ? 'bg-[#d4af37] text-black' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'
            }`}>
              <Globe size={24} />
            </div>
            <h3 className="text-white font-black uppercase italic text-xl">{t('etranger_label')}</h3>
            <p className="text-zinc-500 text-xs mt-2 font-bold uppercase leading-relaxed">
              {t('etranger_desc')}
            </p>
            <div className={`mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
               origin === 'etranger' ? 'text-[#d4af37]' : 'text-zinc-600'
            }`}>
              {t('btn_select')} <ChevronRight size={14} />
            </div>
          </button>

        </div>

        {/* LISTA DE REQUISITOS DINÁMICA */}
        {origin && (
          <div className="mt-12 bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
              <FileText size={16} className="text-[#d4af37]" />
              {t('req_title')}
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-zinc-400">
                <CreditCard size={20} className="text-[#d4af37]" />
                <span className="text-sm font-bold uppercase">{origin === 'maroc' ? t('cin_label') : t('passport_label')}</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <FileText size={20} className="text-[#d4af37]" />
                <span className="text-sm font-bold uppercase tracking-tighter">{t('license_label')}</span>
              </div>
              {origin === 'etranger' && (
                <div className="flex items-center gap-4 text-zinc-400">
                  <Plane size={20} className="text-[#d4af37]" />
                  <span className="text-sm font-bold uppercase">{t('flight_label')}</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => router.push(`/booking/verify/scanner?origin=${origin}&id=${bookingId}`)}
              className="w-full mt-10 bg-[#d4af37] text-black py-5 rounded-2xl font-[1000] uppercase text-sm tracking-[0.2em] hover:bg-white transition-all shadow-xl active:scale-95 italic"
            >
              {t('btn_start')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function VerifyIdentityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-[#d4af37] font-black uppercase tracking-widest animate-pulse">Chargement...</div>}>
      <VerifyContent />
    </Suspense>
  );
}