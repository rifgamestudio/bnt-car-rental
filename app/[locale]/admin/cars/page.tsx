"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Car as CarIcon, 
  User as UserIcon, 
  Check, 
  X, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Image as ImageIcon,
  Upload,
  Loader2,
  Trash2,
  Users, 
  DoorOpen, 
  Wind, 
  Gauge 
} from 'lucide-react';

interface Car {
  id: string;
  brand: string;
  model: string;
  plate: string;
  status: 'available' | 'rented' | 'maintenance';
  price_low: number;
  price_high: number;
  image_url: string;
  images_gallery: string[];
  assigned_user_id: string | null;
  seats: number;
  doors: number;
  ac: boolean;
  category: string;
  transmission: string;
  mileage: string;
  profiles?: {
    full_name: string;
    preferred_locale: string;
  };
}

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'available' | 'rented'>('available');
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [newCar, setNewCar] = useState({
    brand: '',
    model: '',
    plate: '',
    price_low: 0,
    price_high: 0,
    image_url: '',
    seats: 5,
    doors: 5,
    ac: true,
    category: 'ECONOMIQUE',
    transmission: 'Manuelle',
    mileage: 'Illimité'
  });

  const fetchCars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select(`
        *,
        profiles (
          full_name,
          preferred_locale
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error al obtener coches:", error.message);
    }

    if (data) setCars(data as unknown as Car[]);
    setLoading(false);
  };

  useEffect(() => { fetchCars(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToUpload(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEditClick = (car: Car) => {
    setEditingCarId(car.id);
    setNewCar({
      brand: car.brand,
      model: car.model,
      plate: car.plate,
      price_low: car.price_low,
      price_high: car.price_high,
      image_url: car.image_url,
      seats: car.seats || 5,
      doors: car.doors || 5,
      ac: car.ac !== undefined ? car.ac : true,
      category: car.category || 'ECONOMIQUE',
      transmission: car.transmission || 'Manuelle',
      mileage: car.mileage || 'Illimité'
    });
    setPreviewUrl(car.image_url);
    setFileToUpload(null); 
    setIsModalOpen(true);
  };

  const handleDeleteCar = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este vehículo de la flota?")) return;
    
    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      fetchCars();
    }
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let finalImageUrl = newCar.image_url;

      if (fileToUpload) {
        const sanitizedName = fileToUpload.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        const fileName = `${Date.now()}_main_${sanitizedName}`;
        const { error: uploadError } = await supabase.storage.from('cars').upload(`cars_flota/${fileName}`, fileToUpload);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('cars').getPublicUrl(`cars_flota/${fileName}`);
        finalImageUrl = urlData.publicUrl;
      }

      const carData = {
        brand: newCar.brand,
        model: newCar.model,
        plate: newCar.plate,
        price_low: newCar.price_low,
        price_high: newCar.price_high,
        image_url: finalImageUrl,
        images_gallery: [], // Galería vacía al haber quitado la función
        status: 'available',
        seats: newCar.seats,
        doors: newCar.doors,
        ac: newCar.ac,
        category: newCar.category,
        transmission: newCar.transmission,
        mileage: newCar.mileage
      };

      if (editingCarId) {
        const { error } = await supabase.from('cars').update(carData).eq('id', editingCarId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cars').insert([carData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingCarId(null);
      setPreviewUrl(null);
      setFileToUpload(null);
      setNewCar({ brand: '', model: '', plate: '', price_low: 0, price_high: 0, image_url: '', seats: 5, doors: 5, ac: true, category: 'ECONOMIQUE', transmission: 'Manuelle', mileage: 'Illimité' });
      fetchCars();

    } catch (err: any) {
      console.error("ERROR REAL DETECTADO:", err);
      alert(`Error técnico de Supabase: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCars = cars.filter(car => car.status === filter);
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const currentCars = filteredCars.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 text-white relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Véhicule BNT</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase mt-1">Gestion de l'inventaire et des réservations actives</p>
        </div>
        <button 
          onClick={() => {
            setEditingCarId(null);
            setNewCar({ brand: '', model: '', plate: '', price_low: 0, price_high: 0, image_url: '', seats: 5, doors: 5, ac: true, category: 'ECONOMIQUE', transmission: 'Manuelle', mileage: 'Illimité' });
            setPreviewUrl(null);
            setIsModalOpen(true);
          }}
          className="bg-[#ff5f00] text-white px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" /> Ajouter un véhicule
        </button>
      </div>

      <div className="flex gap-4 border-b border-zinc-800 pb-px">
        <button onClick={() => {setFilter('available'); setCurrentPage(1);}} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all ${filter === 'available' ? 'text-[#ff5f00] border-b-2 border-[#ff5f00]' : 'text-zinc-500'}`}>
          Disponibles ({cars.filter(c => c.status === 'available').length})
        </button>
        <button onClick={() => {setFilter('rented'); setCurrentPage(1);}} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all ${filter === 'rented' ? 'text-[#ff5f00] border-b-2 border-[#ff5f00]' : 'text-zinc-500'}`}>
          Loués ({cars.filter(c => c.status === 'rented').length})
        </button>
      </div>

      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        {loading ? (
           <div className="p-20 flex flex-col items-center justify-center gap-4 text-zinc-500">
             <Loader2 className="w-10 h-10 animate-spin text-[#ff5f00]" />
             <p className="font-black uppercase text-xs tracking-widest">Chargement de la flotte...</p>
           </div>
        ) : currentCars.length === 0 ? (
           <div className="p-20 text-center text-zinc-600">
             <CarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
             <p className="font-black uppercase text-xs tracking-widest">Aucun véhicule trouvé</p>
           </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] border-b border-zinc-800">
                <th className="px-8 py-5">Photo</th>
                <th className="px-8 py-5">Marque / Modèle</th>
                <th className="px-8 py-5">Tarifs (MAD)</th>
                <th className="px-8 py-5">Client Assigné</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {currentCars.map((car) => (
                <tr key={car.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="w-32 h-20 bg-black rounded-xl overflow-hidden border border-zinc-800 relative">
                      <img src={car.image_url} className="w-full h-full object-contain p-2" alt="Voiture" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-lg leading-none uppercase italic">{car.brand} {car.model}</p>
                    <p className="text-[#ff5f00] text-[10px] font-black mt-1 uppercase tracking-widest">{car.plate}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-white font-black text-sm">{car.price_low} MAD <span className="text-[9px] text-zinc-500 uppercase">(BASSE)</span></p>
                      <p className="text-orange-400 font-black text-sm">{car.price_high} MAD <span className="text-[9px] text-orange-900 uppercase">(HAUTE)</span></p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {car.profiles ? (
                      <div className="flex items-center gap-3 bg-zinc-800/50 p-3 rounded-2xl border border-zinc-700 w-fit">
                        <UserIcon className="w-4 h-4 text-[#ff5f00]" />
                        <p className="text-[10px] font-black uppercase">{car.profiles.full_name}</p>
                      </div>
                    ) : <span className="text-zinc-700 font-bold text-[10px] italic uppercase tracking-widest">Libre</span>}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => handleEditClick(car)}
                        className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all"
                       >
                        Modifier
                       </button>
                       <button 
                        onClick={() => handleDeleteCar(car.id)}
                        className="text-red-900 hover:text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-2 border border-zinc-800 rounded-lg hover:border-red-900 transition-all"
                       >
                        <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-[#ff5f00]">
                {editingCarId ? 'Modifier le Véhicule' : 'Nouveau Véhicule'}
              </h3>
              <button onClick={() => {setIsModalOpen(false); setEditingCarId(null); setPreviewUrl(null);}} className="text-zinc-500 hover:text-white"><X /></button>
            </div>
            
            <form onSubmit={handleSaveCar} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Marque</label>
                  <input required type="text" value={newCar.brand} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 outline-none focus:border-[#ff5f00]" placeholder="BMW" 
                    onChange={e => setNewCar({...newCar, brand: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Modèle</label>
                  <input required type="text" value={newCar.model} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 outline-none focus:border-[#ff5f00]" placeholder="X5"
                    onChange={e => setNewCar({...newCar, model: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Catégorie</label>
                  <select value={newCar.category} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 outline-none focus:border-[#ff5f00] text-sm font-bold text-white"
                    onChange={e => setNewCar({...newCar, category: e.target.value})}>
                    <option value="MINI">MINI</option>
                    <option value="ECONOMIQUE">ECONOMIQUE</option>
                    <option value="COMPACTE">COMPACTE</option>
                    <option value="SUV">SUV</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Transmission</label>
                  <select value={newCar.transmission} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 outline-none focus:border-[#ff5f00] text-sm font-bold text-white"
                    onChange={e => setNewCar({...newCar, transmission: e.target.value})}>
                    <option value="Manuelle">Manuelle</option>
                    <option value="Automatique">Automatique</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-1"><Users size={10}/> Sièges</label>
                  <input required type="number" value={newCar.seats} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 outline-none focus:border-[#ff5f00]"
                    onChange={e => setNewCar({...newCar, seats: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-1"><DoorOpen size={10}/> Portes</label>
                  <input required type="number" value={newCar.doors} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 outline-none focus:border-[#ff5f00]"
                    onChange={e => setNewCar({...newCar, doors: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-1"><Gauge size={10}/> Kilométrage</label>
                  <input required type="text" value={newCar.mileage} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 outline-none focus:border-[#ff5f00]" placeholder="Illimité"
                    onChange={e => setNewCar({...newCar, mileage: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Matricule</label>
                  <input required type="text" value={newCar.plate} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 outline-none focus:border-[#ff5f00]" placeholder="1234-ABC"
                    onChange={e => setNewCar({...newCar, plate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Precio Bajo (MAD)</label>
                  <input required type="number" value={newCar.price_low} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 outline-none focus:border-[#ff5f00]"
                    onChange={e => setNewCar({...newCar, price_low: Number(e.target.value)})} />
                </div>
                <div className="space-y-2 text-orange-500">
                  <label className="text-[10px] font-black uppercase text-orange-800 font-bold">Precio Alto (MAD)</label>
                  <input required type="number" value={newCar.price_high} className="w-full bg-zinc-800 border border-orange-900/50 rounded-xl p-3 outline-none focus:border-[#ff5f00]"
                    onChange={e => setNewCar({...newCar, price_high: Number(e.target.value)})} />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-zinc-800 p-4 rounded-xl border border-zinc-700">
                <Wind size={16} className={newCar.ac ? "text-blue-400" : "text-zinc-600"} />
                <label className="text-[10px] font-black uppercase text-zinc-300 flex-1">Air Conditionné (AC)</label>
                <input type="checkbox" checked={newCar.ac} className="w-5 h-5 accent-[#ff5f00]"
                  onChange={e => setNewCar({...newCar, ac: e.target.checked})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Photo Principale</label>
                <label className="w-full h-40 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/50 transition-all overflow-hidden relative">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} className="w-full h-full object-cover opacity-60" alt="Preview" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white bg-black/50 px-3 py-1 rounded-full uppercase tracking-tighter">Changer la photo</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-zinc-600 mb-2" />
                      <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest font-bold">Cliquer pour charger</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <button disabled={isSaving} type="submit" className="w-full bg-[#ff5f00] py-4 rounded-xl font-[1000] uppercase text-sm flex items-center justify-center gap-2 hover:bg-[#e65600] transition-all shadow-xl active:scale-95 italic">
                {isSaving ? <Loader2 className="animate-spin" /> : (editingCarId ? "Mettre à jour le véhicule" : "Enregistrer le véhicule")}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-zinc-800">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Page {currentPage} sur {totalPages || 1}</p>
        <div className="flex gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}