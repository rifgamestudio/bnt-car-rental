"use client";
export const dynamic = 'force-dynamic';
import React, { useEffect, useState, Suspense } from 'react'; // Añadido Suspense
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
  X 
} from 'lucide-react';

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

// 1. MOVEMOS LA LÓGICA A ESTE COMPONENTE PARA QUE SUSPENSE PUEDA ENVOLVERLO
function CheckoutContent() {
  const t = useTranslations('Checkout');
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
  const pickupLoc = searchParams.get('pickup') || 'Agence';
  const returnLoc = searchParams.get('return') || 'Agence';
  
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
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!termsAccepted) {
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('bookings').insert({
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
      });

      if (error) throw error;
      setShowModal(true);

    } catch (err: any) {
      console.error("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#ff5f00] w-10 h-10" /></div>;
  if (!car) return <div>Erreur: Voiture introuvable</div>;

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
              <span className="flex items-center gap-1"><Users size={14} /> {car.seats}</span>
              <span className="flex items-center gap-1"><Briefcase size={14} /> {car.doors}</span>
              <span className="flex items-center gap-1"><Settings size={14} /> {car.transmission === 'Automatique' ? 'A' : 'M'}</span>
              {car.ac && <span className="flex items-center gap-1">❄️ AC</span>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-black uppercase text-sm mb-4">Destination</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#ff5f00]" />
              <div>
                <p className="text-xs font-bold uppercase">{pickupLoc}</p>
                <p className="text-[10px] text-gray-400 mt-1">{pickupDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: DATOS DE RESERVA */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="bg-[#ff5f00] text-white p-2 rounded-lg">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">{t('title')}</h2>
            </div>

            {/* FECHAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-gray-50 p-6 rounded-xl">
              <div>
                <p className="text-[10px] font-black text-[#ff5f00] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MapPin size={12} /> {t('pickup')}
                </p>
                <p className="text-lg font-black capitalize">{new Date(pickupDate || '').toLocaleDateString()}</p>
                <p className="text-sm font-bold text-gray-500">10:30 (Exemple)</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">{pickupLoc}</p>
              </div>
              <div className="md:border-l md:border-gray-200 md:pl-8">
                <p className="text-[10px] font-black text-[#ff5f00] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MapPin size={12} /> {t('dropoff')}
                </p>
                <p className="text-lg font-black capitalize">{new Date(returnDate || '').toLocaleDateString()}</p>
                <p className="text-sm font-bold text-gray-500">10:30 (Exemple)</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">{returnLoc}</p>
              </div>
            </div>

            {/* PRECIO */}
            <div className="flex justify-between items-center py-6 border-t border-b border-gray-100 mb-8">
              <div>
                <p className="font-bold text-gray-600 uppercase text-sm">{t('car_rental')}</p>
                <p className="text-xs text-gray-400">{days} Jours</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-[1000] tracking-tighter text-black">{price} MAD</p>
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{t('total')}</p>
              </div>
            </div>

            {/* INCLUSIONES */}
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

            {/* CHECKBOX TÉRMINOS */}
            <div className="flex items-center gap-3 mb-8 bg-gray-50 p-4 rounded-lg">
              <input 
                type="checkbox" 
                id="terms" 
                className="w-5 h-5 accent-[#ff5f00] cursor-pointer"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms" className="text-xs font-bold text-gray-500 cursor-pointer select-none">
                {t('terms')}
              </label>
            </div>

            {/* BOTÓN RESERVAR */}
            <button 
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full bg-black text-white py-5 rounded-2xl font-[1000] uppercase text-base tracking-[0.2em] hover:bg-[#ff5f00] transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {submitting ? <Loader2 className="animate-spin" /> : t('btn_confirm')}
            </button>

          </div>
        </div>
      </div>

      {/* VENTANA EMERGENTE DE CONFIRMACIÓN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-in-center border border-gray-100">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8">
              {t('success_alert')}
            </h3>
            <button 
              onClick={() => router.push('/booking')}
              className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#ff5f00] transition-all"
            >
              Voir mes réservations
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// 2. EXPORTAMOS LA PÁGINA ENVUELTA EN SUSPENSE (OBLIGATORIO PARA VERCEL)
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white uppercase font-black tracking-widest animate-pulse">Chargement...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}