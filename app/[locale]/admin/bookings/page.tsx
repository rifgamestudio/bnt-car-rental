"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, 
  User, 
  Car as CarIcon, 
  Clock, 
  MapPin, 
  CheckCircle, 
  X,
  Loader2,
  ChevronRight,
  Trash2,
  Archive,
  AlertTriangle 
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Booking {
  id: string;
  user_id: string; 
  pickup_location: string;
  return_location: string;
  pickup_date: string;
  return_date: string;
  pickup_time: string;
  return_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed';
  car_id: string | null;
  is_archived?: boolean; 
  profiles: {
    full_name: string;
    phone: string;
    status: string;
    rental_history: string[]; 
  };
  cars?: {
    brand: string;
    model: string;
    plate: string;
  };
}

interface CarAvailable {
  id: string;
  brand: string;
  model: string;
  plate: string;
}

export default function AdminBookingsPage() {
  const t = useTranslations('AdminBookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableCars, setAvailableCars] = useState<CarAvailable[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal de borrado
  const [itemToDelete, setItemToDelete] = useState<{id: string, carId: string | null} | null>(null);
  
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [returnNotes, setReturnNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    
    const { data: bData } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles (*),
        cars (brand, model, plate)
      `)
      .order('created_at', { ascending: false });

    const { data: cData } = await supabase
      .from('cars')
      .select('id, brand, model, plate')
      .eq('status', 'available');

    if (bData) setBookings(bData as unknown as Booking[]);
    if (cData) setAvailableCars(cData as CarAvailable[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssignAndConfirm = async (bookingId: string, carId: string) => {
    if (!carId) return;
    setProcessingId(bookingId);

    const { error: bError } = await supabase
      .from('bookings')
      .update({ car_id: carId, status: 'confirmed' })
      .eq('id', bookingId);

    const booking = bookings.find(b => b.id === bookingId);
    
    const { error: cError } = await supabase
      .from('cars')
      .update({ status: 'rented', assigned_user_id: booking?.user_id })
      .eq('id', carId);

    if (!bError && !cError) fetchData();
    setProcessingId(null);
  };

  const openReturnModal = (booking: Booking) => {
    setCurrentBooking(booking);
    setIsReturnModalOpen(true);
  };

  const processReturn = async () => {
    if (!currentBooking) return;
    setProcessingId(currentBooking.id);

    await supabase.from('bookings').update({ status: 'completed' }).eq('id', currentBooking.id);
    
    if (currentBooking.car_id) {
      await supabase.from('cars').update({ status: 'available', assigned_user_id: null }).eq('id', currentBooking.car_id);
    }

    if (returnNotes.trim() !== '') {
      const newNote = `${new Date().toLocaleDateString('fr-FR')}: ${returnNotes}`;
      const currentHistory = currentBooking.profiles.rental_history || [];
      const updatedHistory = [...currentHistory, newNote];

      await supabase.from('profiles').update({ rental_history: updatedHistory }).eq('id', currentBooking.user_id);
    }

    setReturnNotes('');
    setIsReturnModalOpen(false);
    fetchData();
    setProcessingId(null);
  };

  // Abre la ventana de confirmación en lugar del confirm del navegador
  const handleDeleteClick = (id: string, carId: string | null) => {
    setItemToDelete({ id, carId });
    setIsDeleteModalOpen(true);
  };

  // Ejecuta el borrado final
  const executeDelete = async () => {
    if (!itemToDelete) return;
    setProcessingId(itemToDelete.id);

    if (itemToDelete.carId) {
      await supabase.from('cars').update({ status: 'available', assigned_user_id: null }).eq('id', itemToDelete.carId);
    }

    await supabase.from('bookings').delete().eq('id', itemToDelete.id);
    
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    fetchData();
    setProcessingId(null);
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'active') {
      return !b.is_archived && b.status !== 'completed';
    } else {
      return b.is_archived || b.status === 'completed';
    }
  });

  if (loading) return (
    <div className="p-20 flex justify-center italic text-zinc-500 uppercase font-black tracking-widest">
      <Loader2 className="animate-spin mr-2" /> Chargement des réservations...
    </div>
  );

  return (
    <div className="space-y-6 text-white px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-[1000] uppercase italic tracking-tighter">{t('title')}</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase mt-1">{t('subtitle')}</p>
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-[#ff5f00] text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            Actives
          </button>
          <button 
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'archived' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            Terminées
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {filteredBookings.length === 0 ? (
          <div className="bg-zinc-900 p-20 rounded-3xl text-center border border-zinc-800">
            <p className="text-zinc-600 font-black uppercase text-sm tracking-widest">{t('no_bookings')}</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className={`bg-zinc-900 border ${booking.status === 'pending' ? 'border-[#ff5f00]/30' : 'border-zinc-800'} rounded-xl overflow-hidden shadow-sm transition-all relative group hover:border-[#ff5f00] hover:shadow-lg`}>
              
              <div className="flex flex-col xl:flex-row items-center">
                
                {/* INFO CLIENTE */}
                <div className="px-4 py-3 border-b xl:border-b-0 xl:border-r border-zinc-800 xl:w-1/4 w-full flex items-center justify-between xl:justify-start gap-3 bg-black/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-black text-xs uppercase truncate max-w-[120px]">{booking.profiles.full_name}</p>
                      <p className="text-[9px] font-bold text-zinc-500">{booking.profiles.phone}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    booking.profiles.status === 'verified' ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'
                  }`}>
                    {booking.profiles.status === 'verified' ? 'Vérifié' : 'Non Vérifié'}
                  </span>
                </div>

                {/* INFO RECOGIDA/DEVOLUCIÓN */}
                <div className="px-4 py-2 xl:w-2/4 w-full grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3 h-3 text-[#ff5f00]" />
                      <p className="font-bold uppercase truncate">
                        {booking.pickup_location && booking.pickup_location !== 'null' ? booking.pickup_location : 'Lieu de prise en charge'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 pl-5">
                       <span className="font-mono">{booking.pickup_date && booking.pickup_date !== 'null' ? booking.pickup_date : '--/--/--'}</span>
                       <span className="text-zinc-600">|</span>
                       <span className="font-mono">{booking.pickup_time || '--:--'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center border-l border-zinc-800 pl-2">
                    <div className="flex items-center gap-2 mb-1">
                      <ChevronRight className="w-3 h-3 text-zinc-600" />
                      <p className="font-bold uppercase truncate">
                        {booking.return_location && booking.return_location !== 'null' ? booking.return_location : 'Lieu de retour'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 pl-5">
                       <span className="font-mono">{booking.return_date && booking.return_date !== 'null' ? booking.return_date : '--/--/--'}</span>
                       <span className="text-zinc-600">|</span>
                       <span className="font-mono">{booking.return_time || '--:--'}</span>
                    </div>
                  </div>
                </div>

                {/* ASIGNACIÓN Y ACCIONES */}
                <div className="px-4 py-2 xl:w-1/4 w-full bg-white/5 flex items-center justify-between xl:justify-end gap-4">
                   <div className="text-right">
                      <p className="text-xl font-[1000] text-[#ff5f00] italic leading-none">{booking.total_price}<span className="text-[9px] text-zinc-500 ml-1">MAD</span></p>
                   </div>

                   <div className="min-w-[140px] flex items-center justify-end gap-2">
                     {booking.status === 'pending' ? (
                        <>
                          <select 
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-1.5 text-[9px] font-bold uppercase outline-none focus:border-[#ff5f00]"
                            onChange={(e) => handleAssignAndConfirm(booking.id, e.target.value)}
                            disabled={processingId === booking.id}
                          >
                            <option value="">{t('select_car')}</option>
                            {availableCars.map(car => (
                              <option key={car.id} value={car.id}>{car.brand} {car.model}</option>
                            ))}
                          </select>
                          
                          <button 
                            onClick={() => handleDeleteClick(booking.id, booking.car_id)}
                            className="p-1.5 bg-zinc-800 hover:bg-red-900/50 text-zinc-500 hover:text-red-500 rounded-lg transition-colors border border-zinc-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                     ) : booking.status === 'confirmed' ? (
                        <button 
                          onClick={() => openReturnModal(booking)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg text-[9px] font-black uppercase transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-3 h-3" /> Terminer
                        </button>
                     ) : (
                       <div className="flex items-center gap-2">
                         <span className="text-zinc-500 font-black text-[9px] uppercase border border-zinc-800 px-3 py-1 rounded-full tracking-widest flex items-center justify-center gap-1">
                           <CheckCircle className="w-3 h-3 text-green-500" /> Fini
                         </span>
                         <button 
                            onClick={() => handleDeleteClick(booking.id, booking.car_id)}
                            disabled={processingId === booking.id}
                            className="p-1.5 bg-zinc-800 hover:bg-red-600 text-zinc-500 hover:text-white rounded-lg transition-all border border-zinc-700 flex items-center gap-1 group/arch"
                          >
                            {processingId === booking.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Trash2 className="w-3 h-3" />}
                            <span className="text-[8px] font-black uppercase">Supprimer</span>
                          </button>
                       </div>
                     )}
                   </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE DEVOLUCIÓN Y VALORACIÓN */}
      {isReturnModalOpen && currentBooking && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black">
              <div>
                <h3 className="text-xl font-black uppercase italic text-white">Retour du Véhicule</h3>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Client: {currentBooking.profiles.full_name}</p>
              </div>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-4">
                 <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-[#ff5f00]"><CarIcon className="w-5 h-5"/></div>
                 <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase">Véhicule à rendre</p>
                    <p className="text-sm font-bold text-white uppercase">{currentBooking.cars?.brand} {currentBooking.cars?.model}</p>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Note sur l'état / Incident</label>
                <textarea 
                  className="w-full h-32 bg-black border border-zinc-800 rounded-xl p-4 text-sm text-white outline-none focus:border-[#ff5f00] transition-all resize-none"
                  placeholder="Le véhicule est rendu en bon état ? Kilométrage ok ?..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800 grid grid-cols-2 gap-4 bg-black/50">
              <button onClick={() => setIsReturnModalOpen(false)} className="py-3 rounded-xl text-xs font-black uppercase text-zinc-500 hover:bg-zinc-800 transition-all">Annuler</button>
              <button 
                onClick={processReturn} 
                disabled={processingId === currentBooking.id}
                className="py-3 bg-green-600 text-white rounded-xl text-xs font-black uppercase hover:bg-green-500 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {processingId ? <Loader2 className="animate-spin w-4 h-4"/> : "Confirmer le retour"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENTANA DE CONFIRMACIÓN DE BORRADO (REEMPLAZA AL NAVEGADOR) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-900/30 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black uppercase italic text-white mb-2 tracking-tighter">Confirmation</h3>
              <p className="text-zinc-500 text-xs font-bold leading-relaxed uppercase tracking-widest">
                Êtes-vous sûr de vouloir supprimer esta réservation définitivement ? Cette action est irréversible.
              </p>
            </div>
            <div className="p-4 bg-black/50 grid grid-cols-2 gap-3">
              <button 
                onClick={() => {setIsDeleteModalOpen(false); setItemToDelete(null);}} 
                className="py-3 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:bg-zinc-800 transition-all tracking-widest"
              >
                Annuler
              </button>
              <button 
                onClick={executeDelete} 
                disabled={!!processingId}
                className="py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-red-500 transition-all shadow-lg flex items-center justify-center gap-2 tracking-widest"
              >
                {processingId ? <Loader2 className="animate-spin w-3 h-3"/> : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}