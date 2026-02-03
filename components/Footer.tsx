"use client";

import React from 'react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Instagram, Facebook, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Importamos el contexto de seguridad

export default function Footer() {
  const t = useTranslations('Footer');
  const { user } = useAuth(); // Detectamos si el usuario está logueado

  return (
    <footer className="bg-black text-white pt-20 pb-12 relative overflow-hidden border-t border-zinc-900">
      
      {/* EFECTO VISUAL: COCHE BLANCO (Sutil, 80% más pequeño, viniendo por la derecha) */}
      <div className="absolute bottom-0 right-0 w-[220px] md:w-[380px] opacity-15 pointer-events-none z-0 select-none translate-x-5 translate-y-5">
        <img 
          src="https://www.sixt.es/fileadmin/files/global/user_upload/fleet/png/350x200/bmw-x5-5d-black-2023.png" 
          alt="" 
          className="w-full h-auto object-contain brightness-[20] grayscale"
          style={{ filter: 'brightness(10) contrast(1)' }} 
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* COLUMNA 1: LOGO Y ESENCIA */}
          <div className="space-y-8">
            <img src="/logo.png" alt="BNT Luxury Logo" className="h-14 w-auto object-contain" />
            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xs uppercase tracking-wide">
              {t('about') || "L'excellence dans la location de voitures de luxe au Maroc. Une expérience exclusive à chaque trajet."}
            </p>
            <div className="flex gap-6">
               <a href="#" className="text-zinc-500 hover:text-[#9d8032] transition-all transform hover:scale-110"><Instagram size={22}/></a>
               <a href="#" className="text-zinc-500 hover:text-[#9d8032] transition-all transform hover:scale-110"><Facebook size={22}/></a>
            </div>
          </div>

          {/* COLUMNA 2: NAVEGACIÓN (CONDICIONAL) */}
          <div>
            <h4 className="text-[#9d8032] text-xs font-black uppercase tracking-[0.3em] mb-10 border-l-2 border-[#9d8032] pl-3">Navigation</h4>
            <ul className="space-y-5 text-sm font-bold uppercase tracking-widest text-zinc-400">
              <li><Link href="/" className="hover:text-white transition-colors no-underline">Accueil</Link></li>
              
              {/* CORRECCIÓN: Solo visible si el usuario está logueado */}
              {user && (
                <li><Link href="/booking" className="hover:text-white transition-colors no-underline">Réservations</Link></li>
              )}
              
              <li><Link href="/contact" className="hover:text-white transition-colors no-underline">Contact</Link></li>
            </ul>
          </div>

          {/* COLUMNA 3: CONTACTO (Letras más grandes) */}
          <div>
            <h4 className="text-[#9d8032] text-xs font-black uppercase tracking-[0.3em] mb-10 border-l-2 border-[#9d8032] pl-3">Contact</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin size={20} className="text-[#9d8032] shrink-0" />
                <span className="text-sm font-bold text-zinc-300 leading-snug uppercase">2 RUE ANNABIA SECT 11, RABAT</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={20} className="text-[#9d8032] shrink-0" />
                <a href="mailto:contact@bnt.ma" className="text-sm font-bold text-zinc-300 hover:text-white no-underline uppercase tracking-tighter transition-colors">contact@bnt.ma</a>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={20} className="text-[#9d8032] shrink-0" />
                <span className="text-sm font-bold text-zinc-300">+212 600 000 000</span>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: LEGAL (DATOS FISCALES - MÁS VISIBLES) */}
          <div className="bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800/60 backdrop-blur-md shadow-2xl">
            <h4 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-8">Informations Légales</h4>
            <div className="space-y-5">
               <div className="pb-3 border-b border-zinc-800">
                 <p className="text-[9px] text-[#9d8032] font-black uppercase tracking-widest mb-1">Raison Sociale</p>
                 <p className="text-xs font-black text-zinc-200 uppercase italic">LUXURY BONAT CARS</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter mb-1">ID Fiscal</p>
                   <p className="text-xs font-bold text-zinc-400">52649058</p>
                 </div>
                 <div>
                   <p className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter mb-1">ICE</p>
                   <p className="text-xs font-bold text-zinc-400">003120525000025</p>
                 </div>
               </div>
               <div className="pt-2">
                 <p className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter mb-1">Taxe professionnelle</p>
                 <p className="text-xs font-bold text-zinc-400">25561617</p>
               </div>
               <div>
                 <p className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter mb-1">Ville</p>
                 <p className="text-xs font-bold text-zinc-400 uppercase">RABAT</p>
               </div>
            </div>
          </div>

        </div>

        {/* BARRA FINAL COPYRIGHT */}
        <div className="pt-10 border-t border-zinc-900/80 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
          <p className="text-center md:text-left">© {new Date().getFullYear()} BNT LUXURY BONAT CARS. {t('rights') || "Tous droits réservés."}</p>
          <div className="flex gap-8">
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}