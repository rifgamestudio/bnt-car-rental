"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useTranslations, useLocale } from 'next-intl'; // Importamos useLocale
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Car, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface Booking {
  id: string;
  pickup_location: string;
  return_location: string;
  pickup_date: string;
  return_date: string;
  pickup_time: string;
  return_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  car_id: string | null;
  cars?: {
    brand: string;
    model: string;
    plate: string;
    image_url: string;
  };
}

export default function ClientBookingsPage() {
  const t = useTranslations('Bookings');
  const locale = useLocale(); // Obtenemos el idioma actual (fr, en, nl)
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para formatear la fecha bonita (Ej: 02 FEB 2025)
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'null') return 'Date N/A';
    try {
      return new Date(dateString).toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).toUpperCase();
    } catch (e) {
      return dateString;
    }
  };

  // Función para limpiar la ubicación si viene nula
  const formatLocation = (loc: string) => {
    if (!loc || loc === 'null') return 'Aéroport Nador El Aroui'; // Valor por defecto o 'Lieu non spécifié'
    // Mapeo de códigos si usas códigos cortos
    if (loc === 'NDR') return 'Aéroport Nador El Aroui';
    if (loc === 'AHU') return 'Aéroport Al Hoceima';
    if (loc === 'TNG') return 'Aéroport Tanger';
    return loc;
  };

  // Cargar las reservas SOLO del usuario conectado
  const fetchMyBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        cars (brand, model, plate, image_url)
      `)
      .eq('user_id', user.id) // Filtro de seguridad
      .order('created_at', { ascending: false });

    if (data) {
      // FILTRO: Solo mostramos reservas que NO estén completadas ni canceladas
      // Así, cuando el coche se devuelve (completed), desaparece de la vista.
      const activeBookings = (data as unknown as Booking[]).filter(
        (b) => b.status === 'pending' || b.status === 'confirmed'
      );
      setBookings(activeBookings);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMyBookings();
    
    // Suscripción en tiempo real: Si el admin aprueba, la página se actualiza sola
    const channel = supabase
      .channel('public:bookings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, 
        (payload) => {
          if (payload.new.user_id === user?.id) {
            fetchMyBookings(); // Recargar si hay cambios en mis reservas
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (loading) return <div className="min-h-screen bg-[#f3f4f6] pt-32 text-center text-black">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#f3f4f6] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-black italic uppercase tracking-tighter mb-2">{t('title')}</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">{t('subtitle')}</p>

        <div className="space-y-6">
          {bookings.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl text-center shadow-sm">
              <p className="text-zinc-400 font-bold uppercase">{t('no_bookings')}</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-zinc-100">
                
                {/* CABECERA DEL ESTADO */}
                <div className={`px-6 py-4 flex items-center justify-between ${
                  booking.status === 'pending' ? 'bg-orange-50 border-b border-orange-100' : 
                  booking.status === 'confirmed' ? 'bg-black text-white' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center gap-3">
                    {booking.status === 'pending' ? (
                      <Clock className="w-5 h-5 text-orange-600 animate-pulse" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    <span className={`text-xs font-black uppercase tracking-widest ${
                      booking.status === 'pending' ? 'text-orange-700' : 'text-white'
                    }`}>
                      {booking.status === 'pending' ? t('status_pending') : t('status_confirmed')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono opacity-60">#{booking.id.slice(0,8).toUpperCase()}</span>
                </div>

                {/* CUERPO DE LA RESERVA */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Lado Izquierdo: Fechas y Lugares */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-start relative">
                      {/* Línea conectora */}
                      <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-zinc-200"></div>
                      
                      <div className="space-y-6 w-full">
                        {/* Pickup */}
                        <div className="flex gap-4">
                          <div className="w-3 h-3 rounded-full bg-black mt-1.5 relative z-10"></div>
                          <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t('pickup')}</p>
                            {/* APLICAMOS FORMATO DE UBICACIÓN */}
                            <p className="font-bold text-black text-sm uppercase">{formatLocation(booking.pickup_location)}</p>
                            <div className="flex items-center gap-2 mt-1 text-zinc-500">
                              <Calendar className="w-3 h-3" />
                              {/* APLICAMOS FORMATO DE FECHA */}
                              <span className="text-xs font-medium">{formatDate(booking.pickup_date)} • {booking.pickup_time || '12:30'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Return */}
                        <div className="flex gap-4">
                          <div className="w-3 h-3 rounded-full bg-[#ff5f00] mt-1.5 relative z-10"></div>
                          <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t('return')}</p>
                            {/* APLICAMOS FORMATO DE UBICACIÓN */}
                            <p className="font-bold text-black text-sm uppercase">{formatLocation(booking.return_location)}</p>
                            <div className="flex items-center gap-2 mt-1 text-zinc-500">
                              <Calendar className="w-3 h-3" />
                              {/* APLICAMOS FORMATO DE FECHA */}
                              <span className="text-xs font-medium">{formatDate(booking.return_date)} • {booking.return_time || '09:00'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lado Derecho: Coche y Mensajes */}
                  <div className="bg-gray-50 rounded-2xl p-6 flex flex-col justify-center">
                    {booking.status === 'pending' ? (
                      <div className="text-center space-y-4">
                        <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-orange-600">
                          <Clock className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-800 leading-relaxed">
                          {t('msg_pending')}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {t('waiting_car')}
                        </p>
                      </div>
                    ) : booking.status === 'confirmed' && booking.cars ? (
                      <div className="text-center">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">{t('car_assigned')}</p>
                        <img 
                          src={booking.cars.image_url} 
                          alt="Car" 
                          className="w-full h-32 object-contain mb-4 drop-shadow-xl" 
                        />
                        <h3 className="text-xl font-black uppercase italic">{booking.cars.brand} {booking.cars.model}</h3>
                        <p className="text-[#ff5f00] font-mono text-sm font-bold bg-black/5 inline-block px-2 py-1 rounded mt-1">
                          {booking.cars.plate}
                        </p>
                        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-xl text-xs font-bold">
                          {t('msg_confirmed')}
                        </div>
                      </div>
                    ) : null}
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}