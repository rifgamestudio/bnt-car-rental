"use client";
export const dynamic = 'force-dynamic';
import React, { useEffect, useState, Suspense } from 'react'; // Añadido Suspense
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { 
  Users, 
  DoorOpen, 
  Wind, 
  Gauge, 
  Zap, 
  ShieldCheck, 
  Loader2,
  Car as CarIcon,
  Calendar
} from 'lucide-react';
import { Link, useRouter } from '@/navigation'; 

interface Car {
  id: string;
  brand: string;
  model: string;
  category: string;
  transmission: string;
  seats: number;
  doors: number;
  ac: boolean;
  mileage: string;
  image_url: string;
  price_low: number;
  price_high: number;
  status: string;
}

// 1. MOVEMOS TODA LA LÓGICA A ESTE COMPONENTE INTERNO
function ResultsContent() {
  const t = useTranslations('Results');
  const searchParams = useSearchParams();
  const router = useRouter(); 
  
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const airport = searchParams.get('airport');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const startDate = from ? new Date(from) : new Date();
  const endDate = to ? new Date(to) : new Date();
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  useEffect(() => {
    const fetchAvailableCars = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'available')
        .order('price_low', { ascending: true });

      if (error) {
        console.error("Error al obtener coches:", error.message);
      } else {
        setCars(data as Car[]);
      }
      setLoading(false);
    };
    fetchAvailableCars();
  }, []);

  const calculateCarTotal = (priceLow: number, priceHigh: number) => {
    let total = 0;
    let currentDay = new Date(startDate);
    for (let i = 0; i < diffDays; i++) {
      const month = currentDay.getMonth();
      if (month === 6 || month === 7) {
        total += Number(priceHigh);
      } else {
        total += Number(priceLow);
      }
      currentDay.setDate(currentDay.getDate() + 1);
    }
    return total;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        {/* CARGADOR EN DORADO */}
        <Loader2 className="w-12 h-12 animate-spin text-[#d4af37] mb-4" />
        <p className="font-black uppercase text-xs tracking-widest text-zinc-400 italic">Recherche de véhicules disponibles...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] pb-20 text-black font-sans">
      <div className="bg-white border-b border-zinc-200 py-6 px-6 sticky top-[60px] z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 text-white p-3 rounded-xl shadow-lg">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="font-black text-lg uppercase italic leading-none tracking-tighter">
                {airport === 'NDR' ? 'Nador Airport' : airport === 'AHU' ? 'Hoceima Airport' : 'Tanger Airport'}
              </h2>
              <p className="text-zinc-500 text-[10px] font-bold mt-1 uppercase tracking-widest">
                {from} — {to} | <span className="text-black font-black">{diffDays} JOUR(S)</span>
              </p>
            </div>
          </div>
          <Link href="/" className="bg-zinc-100 hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-600 px-6 py-2 rounded-full transition-all no-underline">
            Modifier
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-10">
        <h1 className="text-3xl font-[1000] uppercase italic tracking-tighter mb-8 text-black">
          {cars.length} {t('title')}
        </h1>

        <div className="grid grid-cols-1 gap-6">
          {cars.length === 0 ? (
            <div className="bg-white p-20 rounded-3xl text-center shadow-xl border border-zinc-100">
              <CarIcon size={64} className="mx-auto text-zinc-100 mb-4" />
              <p className="text-zinc-400 font-black uppercase text-sm tracking-widest italic">Aucun véhicule disponible</p>
            </div>
          ) : (
            cars.map((car) => {
              const carTotal = calculateCarTotal(car.price_low, car.price_high);
              const averagePerDay = Math.round(carTotal / diffDays);
              
              return (
                <div key={car.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-zinc-100 flex flex-col md:flex-row hover:border-[#d4af37]/30 transition-all duration-300 group">
                  <div className="md:w-1/3 bg-white p-8 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-zinc-50">
                    <img 
                      src={car.image_url} 
                      alt={`${car.brand} ${car.model}`} 
                      className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="md:w-1/3 p-10 flex flex-col justify-center">
                    {/* CATEGORÍA EN DORADO */}
                    <span className="text-[#d4af37] font-black text-[10px] uppercase tracking-[0.3em] mb-3 italic">
                      {car.category}
                    </span>
                    <h3 className="text-3xl font-[1000] uppercase italic tracking-tighter leading-none mb-6">
                      {car.brand} <span className="text-gray-400">{car.model}</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Users size={16} className="text-zinc-300" />
                        <span className="text-[11px] font-bold uppercase">{car.seats} Places</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <DoorOpen size={16} className="text-zinc-300" />
                        <span className="text-[11px] font-bold uppercase">{car.doors} Portes</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Zap size={16} className={car.transmission === 'Automatique' ? 'text-blue-500' : 'text-zinc-300'} />
                        <span className="text-[11px] font-bold uppercase">{car.transmission}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Wind size={16} className={car.ac ? 'text-blue-400' : 'text-zinc-300'} />
                        <span className="text-[11px] font-bold uppercase italic">Climatisation</span>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-zinc-400 bg-zinc-50 w-fit px-3 py-1 rounded-full border border-zinc-100">
                       <Gauge size={12} />
                       <span className="text-[9px] font-black uppercase tracking-widest">{car.mileage}</span>
                    </div>
                  </div>

                  <div className="md:w-1/3 bg-zinc-50/50 p-10 flex flex-col items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-zinc-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="text-green-600 w-4 h-4" />
                      <span className="text-green-600 text-[10px] font-black uppercase tracking-widest italic leading-none">Annulation gratuite</span>
                    </div>
                    
                    <div className="text-right mt-2">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-5xl font-[1000] text-black tracking-tighter leading-none">{carTotal}</span>
                        <span className="text-sm font-black text-black uppercase">MAD</span>
                      </div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2 leading-none">
                         {diffDays} JOURS | {averagePerDay} MAD / JOUR
                      </p>
                    </div>

                    {/* BOTÓN RÉSERVER EN DORADO */}
                    <button 
                      onClick={() => {
                        router.push(`/booking/checkout?carId=${car.id}&price=${carTotal}&from=${from}&to=${to}&pickup=${airport}&return=${airport}`);
                      }}
                      className="w-full mt-10 bg-[#d4af37] hover:bg-black text-white py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] transition-all shadow-xl active:scale-95 italic"
                    >
                      Réserver
                    </button>
                    
                    <button className="mt-4 text-[9px] font-bold text-zinc-400 hover:text-black underline uppercase tracking-widest transition-colors">
                      Conditions de location
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

// 2. EXPORT PRINCIPAL ENVUELTO EN SUSPENSE (REQUERIDO POR VERCEL)
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f4f6]">
        <Loader2 className="w-12 h-12 animate-spin text-[#d4af37] mb-4" />
        <p className="font-black uppercase text-xs tracking-widest text-zinc-400">Chargement des résultats...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}