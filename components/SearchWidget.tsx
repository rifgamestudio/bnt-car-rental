"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Car, Search, Calendar, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Importamos el estado del usuario
import { useRouter } from 'next/navigation';

export default function SearchWidget() {
  const t = useTranslations('Search');
  const { status } = useAuth(); // Obtenemos el estado: 'guest', 'registered', 'pending', 'verified'
  const router = useRouter();

  const handleSearch = () => {
    // Si el usuario no está verificado, le avisamos y lo mandamos al perfil
    if (status !== 'verified') {
      alert("Por seguridad, debes estar registrado y verificado para buscar y alquilar coches.");
      router.push('/profile'); // O la ruta donde tengas tu formulario de verificación
      return;
    }

    // Si está verificado, aquí iría tu lógica normal de búsqueda
    console.log("Buscando coches...");
  };

  return (
    <div className="w-full max-w-[1240px] bg-white rounded-2xl shadow-[0_15px_45px_rgba(0,0,0,0.1)] p-7 text-black">
      {/* Pestaña Única: Coches */}
      <div className="flex mb-6">
        <div className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full text-[11px] font-bold cursor-default">
          <Car className="w-4 h-4" /> {t('cars').toUpperCase()}
        </div>
      </div>

      {/* Cuerpo del Buscador */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-end">
        
        {/* Bloque 1: Recogida y Devolución */}
        <div className="xl:col-span-4 flex flex-col">
          <label className="text-[10px] font-bold text-gray-800 mb-2 uppercase tracking-tight leading-none">
            {t('pickup_return')}
          </label>
          <div className="flex items-center h-14 border border-gray-300 rounded-lg px-4 bg-white hover:border-gray-950 transition-all relative">
            <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
            <input 
              type="text" 
              placeholder={t('placeholder')} 
              className="w-full outline-none text-[14px] font-medium placeholder:text-gray-300"
            />
            <Plus className="w-4 h-4 text-gray-400 ml-2 cursor-pointer hover:text-black shrink-0" />
          </div>
        </div>

        {/* Bloque 2: Fecha Recogida */}
        <div className="xl:col-span-3 flex flex-col">
          <label className="text-[10px] font-bold text-gray-800 mb-2 uppercase tracking-tight leading-none">
            {t('date_pickup')}
          </label>
          <div className="flex h-14 border border-gray-300 rounded-lg overflow-hidden hover:border-gray-950 transition-all">
            <div className="flex-[1.4] flex items-center px-4 gap-3 border-r border-gray-200 bg-white">
              <Calendar className="w-5 h-5 text-black shrink-0" />
              <span className="text-[14px] font-bold uppercase whitespace-nowrap tracking-tight">02 FEB</span>
            </div>
            <div className="flex-1 flex items-center justify-center text-[14px] font-bold bg-white">12:30</div>
          </div>
        </div>

        {/* Bloque 3: Fecha Devolución */}
        <div className="xl:col-span-3 flex flex-col">
          <label className="text-[10px] font-bold text-gray-800 mb-2 uppercase tracking-tight leading-none">
            {t('date_return')}
          </label>
          <div className="flex h-14 border border-gray-300 rounded-lg overflow-hidden hover:border-gray-950 transition-all">
            <div className="flex-[1.4] flex items-center px-4 gap-3 border-r border-gray-200 bg-white">
              <Calendar className="w-5 h-5 text-black shrink-0" />
              <span className="text-[14px] font-bold uppercase whitespace-nowrap tracking-tight">06 FEB</span>
            </div>
            <div className="flex-1 flex items-center justify-center text-[14px] font-bold bg-white">08:30</div>
          </div>
        </div>

        {/* Bloque 4: Botón (Actualizado con lógica de estado) */}
        <div className="xl:col-span-2">
          <button 
            onClick={handleSearch}
            className={`w-full h-14 text-white rounded-lg font-bold text-[14px] transition-all shadow-md active:scale-95 px-4 whitespace-nowrap flex items-center justify-center ${
              status === 'verified' 
              ? 'bg-[#ff5f00] hover:bg-[#e65600]' 
              : 'bg-gray-400 cursor-pointer'
            }`}
          >
            {status === 'verified' ? t('btn_show') : 'VERIFICAR CUENTA'}
          </button>
        </div>
      </div>
    </div>
  );
}