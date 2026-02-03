"use client";
export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  User as UserIcon, 
  Car as CarIcon, // CORRECCIÓN: Importación de CarIcon añadida
  Globe, 
  Search, 
  Trash2, 
  AlertTriangle,
  Mail,
  Phone,
  MessageCircle,
  Download,
  X 
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';

interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  status: string;
  phone: string;
  country: string;
  preferred_locale: string;
  id_card_front_url?: string;
  id_card_back_url?: string;
  passport_url?: string; 
  license_front_url?: string; 
  license_back_url?: string;
}

export default function AdminUsersPage() {
  const t = useTranslations('Admin');
  const { profile: adminProfile } = useAuth();
  const [users, setUsers] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ClientProfile | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ClientProfile | null>(null);
  
  // NUEVO ESTADO: Modal de error personalizado para bloqueos de borrado
  const [showActiveBookingError, setShowActiveBookingError] = useState(false);

  const fetchUsers = async () => {
    if (!adminProfile?.id) return;
    setLoading(true);
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client') 
      .neq('id', adminProfile.id)
      .order('created_at', { ascending: false });

    if (data) setUsers(data as ClientProfile[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [adminProfile?.id]);

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

  const updateStatus = async (userId: string, newStatus: 'verified' | 'rejected' | 'registered') => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId);

    if (!error) {
      fetchUsers(); 
      setSelectedUser(null);
    }
  };

  const deleteUser = async () => {
    if (!userToDelete) return;

    // --- LÓGICA DE SEGURIDAD: Bloquear si tiene coche alquilado ---
    const { data: activeBookings, error: checkError } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', userToDelete.id)
      .in('status', ['pending', 'confirmed', 'active']); 

    if (activeBookings && activeBookings.length > 0) {
      // CORRECCIÓN: Sustituimos alert por modal personalizado
      setIsDeleteModalOpen(false);
      setShowActiveBookingError(true);
      return;
    }
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userToDelete.id);

    if (!error) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-[1000] text-white italic uppercase tracking-tighter">{t('users_title')}</h2>
          <p className="text-zinc-500 font-bold text-[10px] uppercase mt-1">{t('users_subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input 
              type="text"
              placeholder="Rechercher un usuario..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-white outline-none focus:border-[#ff5f00] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase whitespace-nowrap">
            {t('total_label', { count: users.length })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-white animate-pulse font-bold uppercase tracking-widest p-20 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800 text-xs">
          {t('loading')}
        </div>
      ) : (
        <div className="overflow-hidden bg-zinc-900 rounded-xl border border-zinc-800 shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-zinc-500 text-[9px] font-black uppercase tracking-widest border-b border-zinc-800">
                <th className="px-4 py-3">{t('table_client')}</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">{t('table_status')}</th>
                <th className="px-4 py-3">{t('table_country')}</th>
                <th className="px-4 py-3">{t('table_phone')}</th>
                <th className="px-4 py-3 text-right">{t('table_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors group text-[11px]">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 group-hover:text-[#ff5f00] transition-colors border border-zinc-700 relative shrink-0">
                        <UserIcon className="w-3 h-3" />
                        <span className="absolute -bottom-1 -right-1 bg-black text-[6px] px-0.5 rounded border border-zinc-700 text-zinc-400 font-bold uppercase">{u.preferred_locale}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold uppercase truncate max-w-[150px] leading-tight">{u.full_name || 'Sin nombre'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-zinc-400 font-medium text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-zinc-700" />
                      <span>{u.email || 'Email non disponible'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      u.status === 'verified' ? 'bg-green-900/20 text-green-500' :
                      u.status === 'pending' ? 'bg-[#ff5f00]/20 text-[#ff5f00] animate-pulse' :
                      u.status === 'rejected' ? 'bg-red-900/20 text-red-500' :
                      'bg-zinc-800 text-zinc-500'
                    }`}>
                      {u.status === 'pending' ? t('status_pending') : 
                       u.status === 'verified' ? t('status_verified') : 
                       u.status === 'rejected' ? t('status_rejected') : u.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-zinc-400 font-bold uppercase text-[9px] tracking-wide">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-zinc-700" />
                      {u.country || 'N/A'}
                    </div>
                  </td>
                  
                  <td className="px-4 py-2 text-zinc-500 font-mono text-[9px]">
                    <div className="flex items-center gap-2">
                      <span>{u.phone || 'N/A'}</span>
                      {u.phone && (
                        <a 
                          href={`https://wa.me/${u.phone.replace(/\+/g, '').replace(/\s/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-green-900/30 hover:bg-green-600 text-green-500 hover:text-white p-1 rounded-md transition-colors"
                          title="Ouvrir WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="inline-flex items-center gap-1 bg-white text-black px-3 py-1 rounded text-[9px] font-black uppercase hover:bg-[#ff5f00] hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <Eye className="w-3 h-3" /> {t('btn_review')}
                      </button>
                      <button 
                        onClick={() => {setUserToDelete(u); setIsDeleteModalOpen(true);}}
                        className="inline-flex items-center justify-center bg-zinc-800 text-zinc-500 p-1.5 rounded hover:bg-red-600 hover:text-white transition-all active:scale-95 border border-zinc-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE ERROR PERSONALIZADO (Coches alquilados) */}
      {showActiveBookingError && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[400] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-[#ff5f00]/30 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 text-center">
                <div className="w-20 h-20 bg-[#ff5f00]/10 text-[#ff5f00] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,95,0,0.1)]">
                   <CarIcon size={40} />
                </div>
                <h3 className="text-2xl font-[1000] uppercase italic text-white mb-4 tracking-tighter">Action Refusée</h3>
                <p className="text-zinc-400 text-xs font-bold leading-relaxed uppercase tracking-widest">
                  Impossible de supprimer cet utilisateur car il possède une <span className="text-[#ff5f00]">réservation active</span> ou un vehículo en sa possession.
                </p>
             </div>
             <div className="p-6 bg-black/50">
                <button 
                  onClick={() => setShowActiveBookingError(false)}
                  className="w-full bg-[#ff5f00] text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-orange-600 transition-all active:scale-95"
                >
                  Compris
                </button>
             </div>
          </div>
        </div>
      )}

      {/* VENTANA DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-900/30 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black uppercase italic text-white mb-2 tracking-tighter">Suppression</h3>
              <p className="text-zinc-500 text-[10px] font-bold leading-relaxed uppercase tracking-widest">
                Êtes-vous sûr de vouloir supprimer cet utilisateur définitivement ? Cette acción est irréversible y compris ses documents.
              </p>
              <p className="mt-4 text-white font-black text-xs uppercase">{userToDelete.full_name}</p>
            </div>
            <div className="p-4 bg-black/50 grid grid-cols-2 gap-3">
              <button 
                onClick={() => {setIsDeleteModalOpen(false); setUserToDelete(null);}} 
                className="py-3 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:bg-zinc-800 transition-all tracking-widest"
              >
                Annuler
              </button>
              <button 
                onClick={deleteUser} 
                className="py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-red-500 transition-all shadow-lg flex items-center justify-center gap-2 tracking-widest"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE REVISIÓN CON DESCARGA DE IMÁGENES */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-zinc-900 w-full max-w-4xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-black">
              <div>
                <h3 className="text-xl font-black text-white uppercase italic leading-none">{t('modal_title')}</h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                   <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{selectedUser.full_name}</p>
                   <span className="text-zinc-800 text-xs">|</span>
                   <p className="text-[#ff5f00] text-[9px] font-black uppercase tracking-tighter">{selectedUser.country}</p>
                   <span className="text-zinc-800 text-xs">|</span>
                   <div className="flex items-center gap-1 text-zinc-400 text-[9px] font-medium lowercase">
                      <Mail className="w-2.5 h-2.5 text-zinc-600" /> {selectedUser.email || 'Email non disponible'}
                   </div>
                   <span className="text-zinc-800 text-xs">|</span>
                   <div className="flex items-center gap-1 text-zinc-400 text-[9px] font-mono">
                      <Phone className="w-2.5 h-2.5 text-zinc-600" /> {selectedUser.phone || '---'}
                   </div>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-zinc-500 hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-zinc-900/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                
                {/* DNI FRONTAL */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{t('id_front')}</p>
                  <div className="aspect-video bg-black rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden shadow-inner relative group">
                    {selectedUser.id_card_front_url || selectedUser.passport_url ? (
                      <>
                        <img src={selectedUser.id_card_front_url || selectedUser.passport_url} alt="Frontal" className="w-full h-full object-contain" />
                        <button 
                          onClick={() => handleDownload(selectedUser.id_card_front_url || selectedUser.passport_url!, 'ID_Front')} 
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download size={14}/>
                        </button>
                      </>
                    ) : (
                      <span className="text-zinc-700 font-bold text-[9px]">{t('no_image')}</span>
                    )}
                  </div>
                </div>

                {/* DNI TRASERO */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{t('id_back')}</p>
                  <div className="aspect-video bg-black rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden shadow-inner relative group">
                    {selectedUser.id_card_back_url ? (
                      <>
                        <img src={selectedUser.id_card_back_url} alt="Trasera" className="w-full h-full object-contain" />
                        <button 
                          onClick={() => handleDownload(selectedUser.id_card_back_url!, 'DNI_Back')} 
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download size={14}/>
                        </button>
                      </>
                    ) : (
                      <span className="text-zinc-700 font-bold text-[9px]">{t('no_image')}</span>
                    )}
                  </div>
                </div>
                
                {/* CARNET FRONTAL */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Permis (Recto)</p>
                  <div className="aspect-video bg-black rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden shadow-inner relative group">
                    {selectedUser.license_front_url ? (
                      <>
                        <img src={selectedUser.license_front_url} alt="Lic Front" className="w-full h-full object-contain" />
                        <button 
                          onClick={() => handleDownload(selectedUser.license_front_url!, 'Lic_Front')} 
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download size={14}/>
                        </button>
                      </>
                    ) : (
                      <span className="text-zinc-700 font-bold text-[9px]">{t('no_image')}</span>
                    )}
                  </div>
                </div>

                {/* CARNET TRASERO */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Permis (Verso)</p>
                  <div className="aspect-video bg-black rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden shadow-inner relative group">
                    {selectedUser.license_back_url ? (
                      <>
                        <img src={selectedUser.license_back_url} alt="Lic Back" className="w-full h-full object-contain" />
                        <button 
                          onClick={() => handleDownload(selectedUser.license_back_url!, 'Lic_Back')} 
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download size={14}/>
                        </button>
                      </>
                    ) : (
                      <span className="text-zinc-700 font-bold text-[9px]">{t('no_image')}</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div className="p-5 bg-black border-t border-zinc-800 grid grid-cols-2 gap-3">
              <button 
                onClick={() => updateStatus(selectedUser.id, 'rejected')}
                className="py-3 border border-red-500 text-red-500 rounded-lg font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all tracking-widest"
              >
                {t('btn_reject')}
              </button>
              <button 
                onClick={() => updateStatus(selectedUser.id, 'verified')}
                className="py-3 bg-green-600 text-white rounded-lg font-black text-[10px] uppercase hover:bg-green-500 hover:scale-[1.02] transition-all shadow-xl tracking-widest"
              >
                {t('btn_approve')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}