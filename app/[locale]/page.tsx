"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import SearchWidget from "@/components/SearchWidget";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { ChevronRight } from "lucide-react";

type Locale = 'en' | 'fr' | 'nl';

export default function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = React.use(params);
  const { user, status, isProfileIncomplete, loading } = useAuth();
  const t = useTranslations('Notifications');

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) return null;

  return (
    <main className="w-full flex flex-col bg-[#f3f4f6] min-h-screen text-black">
      
      {/* SE HA ELIMINADO LA BARRA DE ESTADO DINÁMICA PARA QUE NO APAREZCA EN LA HOME */}

      {/* 2. BLOQUEO SI EL PERFIL ESTÁ INCOMPLETO */}
      {isProfileIncomplete ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-white">
          <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-orange-100 text-[#ff5f00] rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-[1000] tracking-tighter uppercase italic leading-none">
              PRESQUE PRÊT !
            </h2>
            <p className="text-gray-500 font-bold uppercase text-[11px] tracking-widest leading-relaxed">
              {t('complete_profile')}
            </p>
            {/* CORRECCIÓN: Apuntamos de nuevo a /auth/register para ver el formulario de la foto */}
            <Link 
              href="/auth/register" 
              className="flex items-center justify-center gap-2 w-full h-16 bg-[#ff5f00] text-white rounded-2xl font-black text-sm hover:bg-[#e65600] transition-all uppercase shadow-xl group no-underline"
            >
              {t('btn_complete')}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={logout}
              className="text-[10px] font-black text-gray-400 uppercase underline tracking-tighter hover:text-black transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      ) : (
        /* 3. CONTENIDO NORMAL DE LA HOME */
        <>
          <div className="relative w-full h-[550px] flex flex-col items-center pt-14 px-6">
            <div className="relative z-50 w-full flex justify-center">
              <SearchWidget />
            </div>

            <div className="absolute bottom-[-50px] w-full max-w-[1000px] z-40 flex justify-center pointer-events-none">
              <img 
                src="https://www.sixt.es/fileadmin/files/global/user_upload/fleet/png/350x200/bmw-x5-5d-black-2023.png" 
                alt="BMW BNT" 
                className="w-[85%] h-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.2)]"
              />
            </div>
          </div>

          <div className="w-full bg-[#ff5f00] pt-36 pb-28 flex flex-col items-center text-center px-6 relative z-10">
            <h2 className="text-black text-[50px] md:text-[90px] font-[1000] leading-[0.8] tracking-[-0.05em] uppercase mb-8 italic">
              ALQUILA PREMIUM. <br />
              PAGA ECONOMY.
            </h2>
          </div>
        </>
      )}
    </main>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}