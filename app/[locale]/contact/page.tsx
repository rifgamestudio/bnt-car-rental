"use client";

import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('Navbar'); // Usamos el namespace de Navbar o uno nuevo si prefieres

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* CABECERA */}
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-[1000] italic uppercase tracking-tighter text-white leading-none">
            Contact<span className="text-[#ff5f00]">.</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-xs md:text-sm tracking-[0.3em] mt-4 flex items-center gap-2">
            <span className="w-10 h-[2px] bg-[#ff5f00]"></span>
            Assistance Premium 24/7
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* COLUMNA IZQUIERDA: INFORMACIÓN */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* WHATSAPP */}
              <a href="https://wa.me/212600000000" target="_blank" className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-[#ff5f00] transition-all group no-underline">
                <div className="w-12 h-12 bg-[#ff5f00]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="text-[#ff5f00]" />
                </div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">WhatsApp</p>
                <p className="text-white font-bold">+212 6 00 00 00 00</p>
              </a>

              {/* EMAIL */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-[#ff5f00] transition-all group">
                <div className="w-12 h-12 bg-[#ff5f00]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="text-[#ff5f00]" />
                </div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Email</p>
                <p className="text-white font-bold">contact@bnt.com</p>
              </div>

            </div>

            {/* DIRECCIÓN */}
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="text-white" />
                </div>
                <div>
                  <p className="text-[#ff5f00] text-[10px] font-black uppercase tracking-[0.2em] mb-2">Localisation</p>
                  <p className="text-white font-bold text-xl uppercase italic tracking-tighter">Agence Rabat</p>
                  <p className="text-zinc-500 text-sm mt-1">2 RUE ANNABIA SECT 11, RABAT</p>
                </div>
              </div>
            </div>

            {/* HORARIOS */}
            <div className="flex items-center gap-4 px-4">
              <Clock className="text-zinc-700 w-5 h-5" />
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Disponible pour vous 24 heures sur 24, 7 jours sur 7</p>
            </div>
          </div>

          {/* COLUMNA DERECHA: FORMULARIO */}
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl">
            <h2 className="text-black text-3xl font-[1000] uppercase italic tracking-tighter mb-8 leading-none">
              Envoyez un <br /><span className="text-[#ff5f00]">Message</span>
            </h2>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Nom Complet</label>
                  <input type="text" className="w-full bg-zinc-100 border-none rounded-2xl px-5 py-4 text-sm font-bold text-black outline-none focus:ring-2 focus:ring-[#ff5f00]/20 transition-all" placeholder="Votre nom" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Email</label>
                  <input type="email" className="w-full bg-zinc-100 border-none rounded-2xl px-5 py-4 text-sm font-bold text-black outline-none focus:ring-2 focus:ring-[#ff5f00]/20 transition-all" placeholder="votre@email.com" />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Message</label>
                <textarea rows={4} className="w-full bg-zinc-100 border-none rounded-2xl px-5 py-4 text-sm font-bold text-black outline-none focus:ring-2 focus:ring-[#ff5f00]/20 transition-all resize-none" placeholder="Comment pouvons-nous vous aider ?"></textarea>
              </div>

              <button className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-[#ff5f00] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                <Send size={16} />
                Envoyer le message
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}