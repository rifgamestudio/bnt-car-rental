"use client";
export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShieldCheck, 
  Mail, 
  Globe, 
  Calendar,
  Search,
  Loader2,
  MessageCircle,
  X,
  Trash2 // Importado para borrar notas
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  created_at: string;
  status: string;
  rental_history?: string | string[]; // Ajustado para manejar múltiples notas
}

// CORRECCIÓN: En Next.js 15 recibimos params como una Promesa
export default function AdminClientsPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = useTranslations('AdminClients');
  
  // Extraemos el locale usando React.use() para que esté disponible en el renderizado
  const { locale } = React.use(params);

  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null); // Estado para la ventana

  const fetchClients = async () => {
    setLoading(true);
    // Solo traemos perfiles que sean CLIENTES y estén VERIFICADOS
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .eq('status', 'verified')
      .order('full_name', { ascending: true });

    if (error) {
      console.error("Error fetching clients:", error.message);
    } else {
      setClients(data as ClientProfile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // FUNCIÓN PARA BORRAR UNA NOTA ESPECÍFICA
  const handleDeleteNote = async (clientId: string, noteIndex: number) => {
    if (!selectedClient || !Array.isArray(selectedClient.rental_history)) return;

    // Crear el nuevo array sin la nota seleccionada
    const updatedHistory = selectedClient.rental_history.filter((_, i) => i !== noteIndex);

    // Actualizar en Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ rental_history: updatedHistory })
      .eq('id', clientId);

    if (error) {
      console.error("Error deleting note:", error.message);
      return;
    }

    // Actualizar estados locales para reflejar el cambio instantáneamente
    const updatedClient = { ...selectedClient, rental_history: updatedHistory };
    setSelectedClient(updatedClient);
    setClients(clients.map(c => c.id === clientId ? updatedClient : c));
  };

  const filteredClients = clients.filter(client => 
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center text-zinc-500">
      <Loader2 className="w-6 h-6 animate-spin text-[#ff5f00] mb-2" />
      <p className="font-black uppercase text-[10px] tracking-[0.2em]">Chargement...</p>
    </div>
  );

  return (
    <div className="space-y-4 relative"> {/* Espaciado reducido */}
      
      {/* CABECERA COMPACTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-[1000] uppercase italic tracking-tighter flex items-center gap-2">
            <ShieldCheck className="text-[#ff5f00] w-5 h-5" />
            {t('title')}
          </h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase mt-0.5 tracking-widest">{t('subtitle')}</p>
        </div>
        
        <div className="bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800 text-[9px] font-black text-[#ff5f00] tracking-widest uppercase">
          {t('total_label', { count: clients.length })}
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA DELGADA - TEXTO BLANCO AÑADIDO */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Rechercher..." 
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 outline-none focus:border-[#ff5f00] transition-all text-xs font-bold text-white placeholder:text-zinc-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLA DE CLIENTES (VERSIÓN SLIM) */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-[9px] font-[1000] uppercase text-zinc-500 tracking-[0.2em] border-b border-zinc-800">
              <th className="px-4 py-3">{t('table_name')}</th>
              <th className="px-4 py-3">{t('table_contact')}</th>
              <th className="px-4 py-3">{t('table_location')}</th>
              <th className="px-4 py-3">{t('table_joined')}</th>
              <th className="px-4 py-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-600 font-bold uppercase text-[10px] tracking-widest italic">
                  {t('no_clients')}
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-zinc-800/30 transition-colors group text-[11px]">
                  
                  {/* Nombre y Avatar pequeño */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 font-black text-[#ff5f00] text-[9px] uppercase italic">
                        {client.full_name?.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-black text-xs uppercase tracking-tight text-white">{client.full_name}</p>
                        <p className="text-[8px] text-zinc-600 font-mono">ID: {client.id.substring(0, 6)}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contacto Compacto */}
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Mail size={10} />
                        <span className="text-[10px] font-medium truncate max-w-[150px]">{client.email}</span>
                      </div>
                      <a 
                        href={`https://wa.me/${client.phone?.replace('+', '')}`} 
                        target="_blank" 
                        className="flex items-center gap-1.5 text-green-500 hover:text-green-400 transition-colors no-underline mt-0.5"
                      >
                        <MessageCircle size={10} />
                        <span className="text-[10px] font-black tracking-tighter">{client.phone}</span>
                      </a>
                    </div>
                  </td>

                  {/* País */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Globe size={10} className="text-[#ff5f00]" />
                      <span className="text-[10px] font-bold uppercase">{client.country || 'N/A'}</span>
                    </div>
                  </td>

                  {/* Fecha */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Calendar size={10} />
                      <span className="text-[9px] font-bold uppercase">
                        {new Date(client.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: '2-digit' })}
                      </span>
                    </div>
                  </td>

                  {/* Botón Historique */}
                  <td className="px-4 py-2 text-right">
                    <button 
                      onClick={() => setSelectedClient(client)}
                      className="bg-zinc-800 hover:bg-white hover:text-black text-[8px] font-[1000] uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border border-zinc-700 active:scale-95 text-white"
                    >
                      HISTORIQUE
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VENTANA EMERGENTE (MODAL) CON HISTORIAL ORDENADO */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/50">
              <h3 className="text-white font-black uppercase text-xs tracking-tighter italic">
                Historique de: {selectedClient.full_name}
              </h3>
              <button onClick={() => setSelectedClient(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-[#ff5f00] text-[9px] font-black uppercase tracking-[0.2em] mb-4">Comportement & Location</p>
              
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {!selectedClient.rental_history || (Array.isArray(selectedClient.rental_history) && selectedClient.rental_history.length === 0) ? (
                  <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 text-center">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase italic">Aucun historique disponible pour ce client.</p>
                  </div>
                ) : Array.isArray(selectedClient.rental_history) ? (
                  selectedClient.rental_history.map((note, index) => (
                    <div key={index} className="bg-black/50 p-3 rounded-xl border border-zinc-800 flex justify-between items-start group/note">
                      <div className="flex gap-3 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f00] mt-1.5 shrink-0 shadow-[0_0_8px_#ff5f00]" />
                        <p className="text-white text-[11px] font-medium leading-relaxed">{note}</p>
                      </div>
                      {/* BOTÓN BORRAR NOTA */}
                      <button 
                        onClick={() => handleDeleteNote(selectedClient.id, index)}
                        className="text-zinc-600 hover:text-red-500 transition-colors p-1 ml-2"
                        title="Supprimer cette note"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="bg-black/50 p-3 rounded-xl border border-zinc-800 flex justify-between items-start">
                    <div className="flex gap-3 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f00] mt-1.5 shrink-0 shadow-[0_0_8px_#ff5f00]" />
                      <p className="text-white text-[11px] font-medium leading-relaxed">{selectedClient.rental_history}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-zinc-800/50 text-right border-t border-zinc-800">
              <button 
                onClick={() => setSelectedClient(null)}
                className="bg-white text-black text-[9px] font-[1000] uppercase px-6 py-2 rounded-lg hover:bg-[#ff5f00] hover:text-white transition-all shadow-lg active:scale-95"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}