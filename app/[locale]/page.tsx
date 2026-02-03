"use client";

import React, { useRef, useState } from "react";
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
  const th = useTranslations('Home');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) return null;

  const fleet = [
    "bmwx1.webp",
    "clio5.webp",
    "dacia-logan.webp",
    "dacia-sandero.webp",
    "kia-sportage.webp",
    "lodgy.webp"
  ];

  return (
    <main className="w-full flex flex-col bg-[#f3f4f6] min-h-screen text-black">
      
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
        <>
          <div className="relative w-full min-h-[600px] flex flex-col items-center pt-14 px-6">
            
            <div className="absolute top-[40px] w-full max-w-[1200px] z-[60] flex justify-end pr-5 md:pr-20 pointer-events-none">
              <img 
                src="/coche.avif" 
                alt="Car BNT" 
                className="w-[120px] md:w-[170px] h-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.15)]"
              />
            </div>

            <div className="relative z-50 w-full flex flex-col items-center">
              <SearchWidget />

              <div className="mt-12 w-full max-w-6xl text-center">
                <h2 className="text-[#a12b2b] text-3xl md:text-4xl font-bold mb-2">
                  {th('fleet_title')}
                </h2>
                <p className="text-black text-sm md:text-base font-medium mb-10">
                  {th('fleet_subtitle')}
                </p>

                <div className="relative px-4">
                  <div 
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className="flex overflow-x-auto gap-6 md:gap-10 pb-6 px-4 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {fleet.map((car) => (
                      <div key={car} className="flex-none w-40 md:w-56 transition-transform duration-300">
                        <img 
                          src={`/${car}`} 
                          alt={car} 
                          className="w-full h-auto object-contain drop-shadow-lg pointer-events-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AJUSTE DE COLOR: Se cambia el naranja por el dorado/bronce del logo (#9d8032) */}
          <div className="w-full bg-[#9d8032] pt-36 pb-28 flex flex-col items-center text-center px-6 relative z-10">
            <h2 className="text-black text-[50px] md:text-[90px] font-[1000] leading-[0.8] tracking-[-0.05em] uppercase mb-8 italic">
              {th('hero_title_1')} <br />
              {th('hero_title_2')}
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