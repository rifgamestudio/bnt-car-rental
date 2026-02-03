"use client";
export const dynamic = 'force-dynamic';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { 
  Calendar, 
  MapPin, 
  CheckCircle, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Settings, 
  Loader2,
  X,
  DoorOpen,
  Wind
} from 'lucide-react';

// Definimos la interfaz para evitar el error de "unresolved" en VS Code
interface CarDetails {
  id: string;
  brand: string;
  model: string;
  image_url: string;
  seats: number;
  doors: number;
  transmission: string;
  ac: boolean;
}

// 1. COMPONENTE INTERNO CON LA LÓGICA
function CheckoutContent() {
  const t = useTranslations('Checkout');
  const tSearch = useTranslations('Search'); 
  const tAuth = useTranslations('Auth'); 
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Estados
  const [car, setCar] = useState<CarDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showModal, setShowModal] = useState(false); 

  // Datos de la URL
  const carId = searchParams.get('carId');
  const price = searchParams.get('price');
  const pickupDate = searchParams.get('from');
  const returnDate = searchParams.get('to');
  const pickupLocRaw = searchParams.get('pickup');
  const returnLocRaw = searchParams.get('return');

  // Función para formatear ubicaciones y evitar NULL
  const formatLocation = (loc: string | null) => {
    if (!loc || loc === 'null' || loc === 'Agence') return tSearch('agency_hoceima');
    if (loc === 'NDR') return tSearch('airport_nador');
    if (loc === 'AHU') return tSearch('airport_hoceima');
    if (loc === 'TNG') return tSearch('airport_tanger');
    return loc;
  };

  const pickupLoc = formatLocation(pickupLocRaw);
  const returnLoc = formatLocation(returnLocRaw);
  
  // Calcular días
  const start = new Date(pickupDate || '');
  const end = new Date(returnDate || '');
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  useEffect(() => {
    const fetchCar = async () => {
      if (!carId) return;
      const { data } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();
      
      if (data) setCar(data as unknown as CarDetails);
      setLoading(false);
    };
    fetchCar();
  }, [carId]);

  const handleConfirm = async () => {
    // Si no hay usuario, redirigir a registro
    if (!user) {
      router.push('/auth/register');
      return;
    }
    if (!termsAccepted) {
      return;
    }

    setSubmitting(true);

    try {
      // INSERTAMOS Y SELECCIONAMOS EL ID DE LA RESERVA CREADA
      const { data: newBooking, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          car_id: carId, 
          pickup_location: pickupLoc,
          return_location: returnLoc,
          pickup_date: pickupDate,
          return_date: returnDate,
          pickup_time: '10:30', 
          return_time: '10:30',
          total_price: Number(price),
          status: 'pending' 
        })
        .select()
        .single();

      if (error) throw error;

      // REDIRECCIÓN A LA PÁGINA DE VERIFICACIÓN (PASO 2)
      // Pasamos el ID de la reserva para vincular los documentos después
      router.push(`/booking/verify?id=${newBooking.id}`);

    } catch (err: any) {
      console.error("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#d4af37] w-10 h-10" /></div>;
  if (!car) return <div className="min-h-screen flex items-center justify-center text-white uppercase font-black">Error</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-black font-sans relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: COCHE */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <img src={car.image_url} alt={car.model} className="w-full h-auto object-contain mb-4" />
            <h2 className="text-2xl font-[1000] uppercase italic tracking-tighter">{car.brand} {car.model}</h2>
            <p className="text-xs text-gray-400 font-bold uppercase mb-4">OU SIMILAIRE</p>
            
            <div className="flex gap-4 text-gray-500 text-xs font-bold">
              <span className="flex items-center gap-1"><Users size={14} /> {car.seats} {tSearch('cars').toLowerCase() === 'voitures' ? 'places' : 'seats'}</span>
              <span className="flex items-center gap-1"><DoorOpen size={14} /> {car.doors} {tSearch('cars').toLowerCase() === 'voitures' ? 'portes' : 'doors'}</span>
              <span className="flex items-center gap-1"><Settings size={14} /> {car.transmission === 'Automatique' ? 'A' : 'M'}</span>
              {car.ac && <span className="flex items-center gap-1"><Wind size={14} /> AC</span>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-black uppercase text-sm mb-4">{t('pickup')}</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#d4af37]" />
              <div>
                <p className="text-xs font-bold uppercase">{pickupLoc}</p>
                <p className="text-[10px] text-zinc-400 mt-1">{pickupDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: DATOS DE RESERVA */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="bg-[#d4af37] text-white p-2 rounded-lg">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">{t('title')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-gray-50 p-6 rounded-xl">
              <div>
                <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MapPin size={12} /> {t('pickup')}
                </p>
                <p className="text-lg font-black capitalize">{new Date(pickupDate || '').toLocaleDateString()}</p>
                <p className="text-sm font-bold text-gray-500">10:30</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">{pickupLoc}</p>
              </div>
              <div className="md:border-l md:border-gray-200 md:pl-8">
                <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MapPin size={12} /> {t('dropoff')}
                </p>
                <p className="text-lg font-black capitalize">{new Date(returnDate || '').toLocaleDateString()}</p>
                <p className="text-sm font-bold text-gray-500">10:30</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">{returnLoc}</p>
              </div>
            </div>

            <div className="flex justify-between items-center py-6 border-t border-b border-gray-100 mb-8">
              <div>
                <p className="font-bold text-gray-600 uppercase text-sm">{t('car_rental')}</p>
                <p className="text-xs text-gray-400">{days} {t('total').toLowerCase().includes('total') ? 'Jours' : 'Days'}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-[1000] tracking-tighter text-black">{price} MAD</p>
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{t('total')}</p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="font-black text-sm uppercase mb-4">{t('included_title')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold text-gray-600">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span>{t(`feature_${i}` as any)}</span>
                  </div>
                ))}
              </div>
            </div>

            {user && (
              <div className="flex items-center gap-3 mb-8 bg-gray-50 p-4 rounded-lg">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="w-5 h-5 accent-[#d4af37] cursor-pointer"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <label htmlFor="terms" className="text-xs font-bold text-gray-500 cursor-pointer select-none">
                  {t('terms')}
                </label>
              </div>
            )}

            <button 
              onClick={handleConfirm}
              disabled={user ? (submitting || !termsAccepted) : submitting}
              className={`w-full ${!user ? 'bg-[#d4af37]' : 'bg-black'} text-white py-5 rounded-2xl font-[1000] uppercase text-base tracking-[0.2em] hover:opacity-90 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3`}
            >
              {submitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                user ? t('btn_confirm') : tAuth('create_account')
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

// 2. EXPORTACIÓN CON SUSPENSE (REQUERIDO POR VERCEL)
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white uppercase font-black tracking-widest animate-pulse">Chargement...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}