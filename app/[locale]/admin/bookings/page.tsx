"use client";
export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, 
  User, 
  Car as CarIcon, 
  Clock, 
  MapPin, 
  CheckCircle, 
  CheckCircle2,
  X,
  Loader2,
  ChevronRight,
  Trash2,
  Archive,
  AlertTriangle,
  FileSearch,
  Plane,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Download,
  MessageCircle // Icono para WhatsApp
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
  flight_number?: string;
  is_archived?: boolean; 
  locale?: string; // Campo para el idioma del cliente
  profiles: {
    full_name: string;
    phone: string;
    email: string; // Aseguramos que traemos el email
    status: string;
    rental_history: string[]; 
    id_card_front_url?: string;
    id_card_back_url?: string;
    passport_url?: string;
    license_front_url?: string; 
    license_back_url?: string;
    extracted_full_name?: string;
    extracted_doc_number?: string;
    extracted_license_number?: string;
    extracted_birth_date?: string;
    extracted_address?: string;
    extracted_license_date?: string;
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false); 
  
  const [itemToDelete, setItemToDelete] = useState<{id: string, carId: string | null} | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [currentVerifyBooking, setCurrentVerifyBooking] = useState<Booking | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [flightData, setFlightData] = useState<any>(null);
  const [loadingFlight, setLoadingFlight] = useState(false);

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

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error descargando imagen", error);
    }
  };

  const handleAssignAndConfirm = async (bookingId: string, carId: string) => {
    if (!carId) return;
    setProcessingId(bookingId);

    // 1. Actualizar reserva
    const { error: bError } = await supabase
      .from('bookings')
      .update({ car_id: carId, status: 'confirmed' })
      .eq('id', bookingId);

    const booking = bookings.find(b => b.id === bookingId);
    const selectedCar = availableCars.find(c => c.id === carId);
    
    // 2. Actualizar coche
    const { error: cError } = await supabase
      .from('cars')
      .update({ status: 'rented', assigned_user_id: booking?.user_id })
      .eq('id', carId);

    // 3. ENVIAR EMAIL DE CONFIRMACIÓN (RESEND)
    if (!bError && !cError && booking && selectedCar) {
      try {
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: booking.profiles.email,
            customerName: booking.profiles.full_name,
            carName: `${selectedCar.brand} ${selectedCar.model}`,
            plate: selectedCar.plate,
            time: booking.pickup_time,
            locale: booking.locale || 'fr'
          })
        });
      } catch (e) {
        console.error("Erreur lors de l'envoi de l'email", e);
      }
      fetchData();
    }
    setProcessingId(null);
  };

  const handleVerifyAndApprove = async () => {
    if (!currentVerifyBooking) return;
    setProcessingId(currentVerifyBooking.id);

    const { error } = await supabase
      .from('profiles')
      .update({ status: 'verified' })
      .eq('id', currentVerifyBooking.user_id);

    if (!error) {
      setIsVerifyModalOpen(false);
      fetchData();
    }
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

  const handleDeleteClick = (id: string, carId: string | null) => {
    setItemToDelete({ id, carId });
    setIsDeleteModalOpen(true);
  };

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
                
                {/* INFO CLIENTE CON WHATSAPP */}
                <div className="px-4 py-3 border-b xl:border-b-0 xl:border-r border-zinc-800 xl:w-1/4 w-full flex items-center justify-between xl:justify-start gap-3 bg-black/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-black text-xs uppercase truncate max-w-[120px]">{booking.profiles.full_name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] font-bold text-zinc-500">{booking.profiles.phone}</p>
                        {booking.profiles.phone && (
                          <a 
                            href={`https://wa.me/${booking.profiles.phone.replace(/\+/g, '')}`} 
                            target="_blank" 
                            className="text-green-500 hover:text-white transition-colors"
                          >
                            <MessageCircle size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      booking.profiles.status === 'verified' ? 'bg-green-900/30 text-green-500' : 
                      booking.profiles.status === 'pending' ? 'bg-[#d4af37]/20 text-[#d4af37] animate-pulse' : 'bg-red-900/30 text-red-500'
                    }`}>
                      {booking.profiles.status === 'verified' ? 'Vérifié' : booking.profiles.status === 'pending' ? 'À Vérifier' : 'Non Vérifié'}
                    </span>
                  </div>
                </div>

                {/* INFO RECOGIDA/DEVOLUCIÓN */}
                <div className="px-4 py-2 xl:w-2/4 w-full grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3 h-3 text-[#ff5f00]" />
                      <p className="font-bold uppercase truncate">{booking.pickup_location}</p>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 pl-5">
                       <span className="font-mono">{booking.pickup_date}</span>
                       <span className="text-zinc-600">|</span>
                       <span className="font-mono">{booking.pickup_time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center border-l border-zinc-800 pl-2">
                    <div className="flex items-center gap-2 mb-1">
                      <ChevronRight className="w-3 h-3 text-zinc-600" />
                      <p className="font-bold uppercase truncate">{booking.return_location}</p>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 pl-5">
                       <span className="font-mono">{booking.return_date}</span>
                       <span className="text-zinc-600">|</span>
                       <span className="font-mono">{booking.return_time}</span>
                    </div>
                  </div>
                </div>

                {/* ASIGNACIÓN Y ACCIONES */}
                <div className="px-4 py-2 xl:w-1/4 w-full bg-white/5 flex items-center justify-between xl:justify-end gap-4">
                   <div className="text-right">
                      <p className="text-xl font-[1000] text-[#ff5f00] italic leading-none">{booking.total_price}<span className="text-[9px] text-zinc-500 ml-1">MAD</span></p>
                   </div>

                   <div className="min-w-[160px] flex items-center justify-end gap-2">
                     {booking.status === 'pending' ? (
                        <div className="flex flex-col gap-2 w-full">
                          <button 
                            onClick={() => { setCurrentVerifyBooking(booking); setIsVerifyModalOpen(true); }}
                            className="w-full bg-[#d4af37] hover:bg-white text-black py-1.5 rounded-lg text-[8px] font-[1000] uppercase transition-all flex items-center justify-center gap-2 shadow-lg"
                          >
                            <FileSearch size={12} /> Vérifier Documents
                          </button>

                          <div className="flex gap-2">
                            <select 
                              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg p-1 text-[8px] font-bold uppercase outline-none focus:border-[#ff5f00]"
                              onChange={(e) => handleAssignAndConfirm(booking.id, e.target.value)}
                              disabled={processingId === booking.id || booking.profiles.status !== 'verified'}
                            >
                              <option value="">{t('select_car')}</option>
                              {availableCars.map(car => (
                                <option key={car.id} value={car.id}>{car.brand} {car.model}</option>
                              ))}
                            </select>
                            <button onClick={() => handleDeleteClick(booking.id, booking.car_id)} className="p-1.5 bg-zinc-800 text-zinc-500 hover:text-red-500 rounded-lg border border-zinc-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
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
                          <button onClick={() => handleDeleteClick(booking.id, booking.car_id)} className="p-1.5 bg-zinc-800 text-zinc-500 hover:text-white rounded-lg border border-zinc-700">
                             <Trash2 className="w-3 h-3" />
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

      {/* MODAL: VERIFICACIÓN */}
      {isVerifyModalOpen && currentVerifyBooking && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-black/50">
              <div>
                <h3 className="text-2xl font-[1000] uppercase italic text-white leading-none">Vérification d'Identité</h3>
                <p className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.3em] mt-2">Client: {currentVerifyBooking.profiles.full_name}</p>
              </div>
              <button onClick={() => setIsVerifyModalOpen(false)} className="bg-zinc-800 p-2 rounded-full text-zinc-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                   <div className="space-y-4">
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-500 border-l-2 border-[#d4af37] pl-3">Identité</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="aspect-video bg-black rounded-xl border border-zinc-800 overflow-hidden relative group">
                          {currentVerifyBooking.profiles.id_card_front_url || currentVerifyBooking.profiles.passport_url ? (
                            <>
                              <img src={currentVerifyBooking.profiles.id_card_front_url || currentVerifyBooking.profiles.passport_url} className="w-full h-full object-cover" alt="Front" />
                              <button onClick={() => handleDownload(currentVerifyBooking.profiles.id_card_front_url || currentVerifyBooking.profiles.passport_url!, 'ID_Front')} className="absolute top-2 right-2 bg-black/50 hover:bg-black p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"><Download size={14}/></button>
                            </>
                          ) : <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700 italic">Vide</div>}
                        </div>
                        <div className="aspect-video bg-black rounded-xl border border-zinc-800 overflow-hidden relative group">
                          {currentVerifyBooking.profiles.id_card_back_url ? (
                            <>
                              <img src={currentVerifyBooking.profiles.id_card_back_url} className="w-full h-full object-cover" alt="Back" />
                              <button onClick={() => handleDownload(currentVerifyBooking.profiles.id_card_back_url!, 'ID_Back')} className="absolute top-2 right-2 bg-black/50 hover:bg-black p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"><Download size={14}/></button>
                            </>
                          ) : <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700 italic">Vide</div>}
                        </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-500 border-l-2 border-[#d4af37] pl-3">Permis de Conduire</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="aspect-video bg-black rounded-xl border border-zinc-800 overflow-hidden relative group">
                          {currentVerifyBooking.profiles.license_front_url ? (
                            <>
                              <img src={currentVerifyBooking.profiles.license_front_url} className="w-full h-full object-cover" alt="Lic Front" />
                              <button onClick={() => handleDownload(currentVerifyBooking.profiles.license_front_url!, 'Lic_Front')} className="absolute top-2 right-2 bg-black/50 hover:bg-black p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"><Download size={14}/></button>
                            </>
                          ) : <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700 italic">Vide</div>}
                        </div>
                        <div className="aspect-video bg-black rounded-xl border border-zinc-800 overflow-hidden relative group">
                          {currentVerifyBooking.profiles.license_back_url ? (
                            <>
                              <img src={currentVerifyBooking.profiles.license_back_url} className="w-full h-full object-cover" alt="Lic Back" />
                              <button onClick={() => handleDownload(currentVerifyBooking.profiles.license_back_url!, 'Lic_Back')} className="absolute top-2 right-2 bg-black/50 hover:bg-black p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"><Download size={14}/></button>
                            </>
                          ) : <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700 italic">Vide</div>}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="bg-zinc-800/20 p-8 rounded-3xl border border-zinc-800 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText size={20} className="text-[#d4af37]" />
                    <h4 className="text-white font-black uppercase tracking-widest text-sm">Données Extraites (OCR)</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-black/50 p-4 rounded-xl border border-zinc-700 flex justify-between items-center group">
                      <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Nº CIN / Passeport</p>
                        <p className="text-sm font-bold text-white">{currentVerifyBooking.profiles.extracted_doc_number || 'Non détecté'}</p>
                      </div>
                    </div>
                    <div className="bg-black/50 p-4 rounded-xl border border-zinc-700 flex justify-between items-center group">
                      <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Nº Permis</p>
                        <p className="text-sm font-bold text-white">{currentVerifyBooking.profiles.extracted_license_number || 'Non détecté'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-black border-t border-zinc-800 grid grid-cols-2 gap-4">
              <button onClick={() => setIsVerifyModalOpen(false)} className="py-4 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:bg-zinc-800 transition-all tracking-widest">Fermer</button>
              <button 
                onClick={handleVerifyAndApprove}
                disabled={!!processingId}
                className="py-4 bg-[#d4af37] text-black rounded-xl text-[10px] font-black uppercase hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2 tracking-[0.2em]"
              >
                {processingId ? <Loader2 className="animate-spin w-4 h-4"/> : <CheckCircle2 size={16}/>}
                Approuver le client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DEVOLUCIÓN */}
      {isReturnModalOpen && currentBooking && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black">
              <div><h3 className="text-xl font-black uppercase italic text-white">Retour du Véhicule</h3><p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Client: {currentBooking.profiles.full_name}</p></div>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X className="w-6 h-6"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-4"><div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-[#ff5f00]"><CarIcon className="w-5 h-5"/></div><div><p className="text-[10px] font-black text-zinc-500 uppercase">Véhicule à rendre</p><p className="text-sm font-bold text-white uppercase">{currentBooking.cars?.brand} {currentBooking.cars?.model}</p></div></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Note sur l'état / Incident</label><textarea className="w-full h-32 bg-black border border-zinc-800 rounded-xl p-4 text-sm text-white outline-none focus:border-[#ff5f00] transition-all resize-none" placeholder="Le véhicule est rendu en bon état ? Kilométrage ok ?..." value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)}/></div>
            </div>
            <div className="p-6 border-t border-zinc-800 grid grid-cols-2 gap-4 bg-black/50"><button onClick={() => setIsReturnModalOpen(false)} className="py-3 rounded-xl text-xs font-black uppercase text-zinc-500 hover:bg-zinc-800 transition-all">Annuler</button><button onClick={processReturn} disabled={processingId === currentBooking.id} className="py-3 bg-green-600 text-white rounded-xl text-xs font-black uppercase hover:bg-green-500 transition-all shadow-lg flex items-center justify-center gap-2">{processingId ? <Loader2 className="animate-spin w-4 h-4"/> : "Confirmer le retour"}</button></div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINACIÓN */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-900/30 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center"><div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div><h3 className="text-xl font-black uppercase italic text-white mb-2 tracking-tighter">Confirmation</h3><p className="text-zinc-500 text-xs font-bold leading-relaxed uppercase tracking-widest">Êtes-vous sûr de vouloir supprimer cette réservation définitivement ? Cette action est irréversible.</p></div>
            <div className="p-4 bg-black/50 grid grid-cols-2 gap-3"><button onClick={() => {setIsDeleteModalOpen(false); setItemToDelete(null);}} className="py-3 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:bg-zinc-800 transition-all tracking-widest">Annuler</button><button onClick={executeDelete} disabled={!!processingId} className="py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-red-500 transition-all shadow-lg flex items-center justify-center gap-2 tracking-widest">{processingId ? <Loader2 className="animate-spin w-3 h-3"/> : "Supprimer"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}