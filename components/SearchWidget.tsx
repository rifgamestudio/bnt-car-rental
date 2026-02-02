"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Car, Search, Calendar, AlertCircle, ChevronDown, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/navigation'; 

export default function SearchWidget() {
  const t = useTranslations('Search');
  const locale = useLocale(); 
  const { status } = useAuth();
  const router = useRouter();

  const PRICE_LOW_SEASON = 30;  
  const PRICE_HIGH_SEASON = 60; 

  // --- LÓGICA DE FECHA ACTUAL (2026) ---
  const getTomorrowStr = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1); 
    return date.toISOString().split('T')[0];
  };

  const getFutureStr = (daysFromTomorrow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + 1 + daysFromTomorrow);
    return date.toISOString().split('T')[0];
  };

  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  
  const [pickupDate, setPickupDate] = useState(getTomorrowStr()); 
  const [returnDate, setReturnDate] = useState(getFutureStr(3));
  
  const [pickupTime, setPickupTime] = useState('12:30');
  const [returnTime, setReturnTime] = useState('08:30');
  const [showError, setShowError] = useState(false);

  const calculateTotalEstimate = () => {
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    let totalRate = 0;
    let currentDay = new Date(start);

    while (currentDay <= end) {
      const month = currentDay.getMonth(); 
      if (month === 6 || month === 7) {
        totalRate += PRICE_HIGH_SEASON;
      } else {
        totalRate += PRICE_LOW_SEASON;
      }
      currentDay.setDate(currentDay.getDate() + 1);
    }
    return totalRate;
  };

  const handleShowCars = () => {
    if (!pickupLocation || !returnLocation) {
      alert("Por favor, selecciona los lugares de recogida y devolución."); 
      return;
    }
    
    const total = calculateTotalEstimate();
    router.push(`/booking/results?pickup=${pickupLocation}&return=${returnLocation}&from=${pickupDate}&timeFrom=${pickupTime}&to=${returnDate}&timeTo=${returnTime}&estimated=${total}`);
  };

  return (
    <div key={locale} className="w-full max-w-[1300px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-8 text-black relative border border-gray-100">
      
      {showError && (
        <div className="absolute -top-20 left-0 right-0 flex justify-center z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 font-bold uppercase text-[11px] tracking-widest border border-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{t('error_verify')}</span>
          </div>
        </div>
      )}

      {/* Pestaña Única: Coches */}
      <div className="flex mb-8">
        <div className="flex items-center gap-2 bg-black text-white px-7 py-3 rounded-full text-[12px] font-black uppercase tracking-widest cursor-default shadow-lg">
          <Car className="w-4 h-4" /> {t('cars').toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
        
        {/* 1. LIEU DE DÉPART - CORREGIDO CIERRE DE LISTA */}
        <div className="flex flex-col">
          <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1 leading-none">
            {t('pickup_label')}
          </label>
          <div 
            className="relative flex items-center h-14 border border-gray-200 rounded-2xl px-4 bg-gray-50 hover:bg-white hover:border-black transition-all cursor-pointer group"
            onClick={(e) => {
              // Si el clic viene del select, no hacemos nada (el select ya se encarga)
              if ((e.target as HTMLElement).tagName === 'SELECT') return;
              const select = e.currentTarget.querySelector('select');
              if (select) (select as any).showPicker?.() || select.focus();
            }}
          >
            <Search className="w-4 h-4 text-gray-400 mr-3 shrink-0 group-hover:text-black" />
            <select 
              className="w-full outline-none text-[13px] font-bold uppercase appearance-none bg-transparent cursor-pointer text-black z-10"
              value={pickupLocation}
              onChange={(e) => {
                setPickupLocation(e.target.value);
                e.target.blur(); // CIERRA LA LISTA AL SELECCIONAR
              }}
            >
              <option value="" disabled>{t('placeholder')}</option>
              <option value="NDR">{t('airport_nador')}</option>
              <option value="AHU">{t('airport_hoceima')}</option>
              <option value="TNG">{t('airport_tanger')}</option>
              <option value="AGH">{t('agency_hoceima')}</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-300 absolute right-4" />
          </div>
        </div>

        {/* 2. LIEU DE RETOUR - CORREGIDO CIERRE DE LISTA */}
        <div className="flex flex-col">
          <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1 leading-none">
            {t('return_label')}
          </label>
          <div 
            className="relative flex items-center h-14 border border-gray-200 rounded-2xl px-4 bg-gray-50 hover:bg-white hover:border-black transition-all cursor-pointer group"
            onClick={(e) => {
              if ((e.target as HTMLElement).tagName === 'SELECT') return;
              const select = e.currentTarget.querySelector('select');
              if (select) (select as any).showPicker?.() || select.focus();
            }}
          >
            <MapPin className="w-4 h-4 text-gray-400 mr-3 shrink-0 group-hover:text-black" />
            <select 
              className="w-full outline-none text-[13px] font-bold uppercase appearance-none bg-transparent cursor-pointer text-black z-10"
              value={returnLocation}
              onChange={(e) => {
                setReturnLocation(e.target.value);
                e.target.blur(); // CIERRA LA LISTA AL SELECCIONAR
              }}
            >
              <option value="" disabled>{t('placeholder')}</option>
              <option value="NDR">{t('airport_nador')}</option>
              <option value="AHU">{t('airport_hoceima')}</option>
              <option value="TNG">{t('airport_tanger')}</option>
              <option value="AGH">{t('agency_hoceima')}</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-300 absolute right-4" />
          </div>
        </div>

        {/* 3. FECHA Y HORA RECOGIDA */}
        <div className="flex flex-col">
          <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1 leading-none">
            {t('date_pickup')}
          </label>
          <div className="flex h-14 border border-gray-200 rounded-2xl overflow-hidden hover:border-black transition-all bg-gray-50 items-center">
            <div 
              className="flex-[1.4] flex items-center px-4 gap-3 border-r border-gray-200 h-full cursor-pointer hover:bg-white transition-colors"
              onClick={(e) => (e.currentTarget.querySelector('input') as any)?.showPicker()}
            >
              <Calendar className="w-4 h-4 text-black shrink-0" />
              <input 
                type="date" 
                min={getTomorrowStr()}
                className="font-bold uppercase text-[12px] outline-none w-full bg-transparent text-black cursor-pointer"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
              />
            </div>
            <div 
              className="flex-1 flex items-center justify-center h-full cursor-pointer hover:bg-white transition-colors"
              onClick={(e) => (e.currentTarget.querySelector('input') as any)?.showPicker()}
            >
              <input 
                type="time" 
                className="bg-transparent text-[12px] font-black text-gray-700 outline-none w-full text-center cursor-pointer h-full"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 4. FECHA Y HORA DEVOLUCIÓN */}
        <div className="flex flex-col">
          <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1 leading-none">
            {t('date_return')}
          </label>
          <div className="flex h-14 border border-gray-200 rounded-2xl overflow-hidden hover:border-black transition-all bg-gray-50 items-center">
            <div 
              className="flex-[1.4] flex items-center px-4 gap-3 border-r border-gray-200 h-full cursor-pointer hover:bg-white transition-colors"
              onClick={(e) => (e.currentTarget.querySelector('input') as any)?.showPicker()}
            >
              <Calendar className="w-4 h-4 text-black shrink-0" />
              <input 
                type="date" 
                min={pickupDate}
                className="font-bold uppercase text-[12px] outline-none w-full bg-transparent text-black cursor-pointer"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
            <div 
              className="flex-1 flex items-center justify-center h-full cursor-pointer hover:bg-white transition-colors"
              onClick={(e) => (e.currentTarget.querySelector('input') as any)?.showPicker()}
            >
              <input 
                type="time" 
                className="bg-transparent text-[12px] font-black text-gray-700 outline-none w-full text-center cursor-pointer h-full"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 5. BOTÓN MOSTRAR COCHES */}
        <div className="flex">
          <button 
            onClick={handleShowCars}
            className="w-full h-14 bg-[#ff5f00] hover:bg-[#e65600] text-white rounded-2xl font-[1000] text-[13px] uppercase italic tracking-[0.1em] transition-all shadow-[0_10px_30px_rgba(255,95,0,0.3)] active:scale-95 px-4 whitespace-nowrap flex items-center justify-center"
          >
            {t('btn_show')}
          </button>
        </div>
      </div>
    </div>
  );
}