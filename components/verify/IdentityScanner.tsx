"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase'; 
import { useAuth } from '@/context/AuthContext';

export default function IdentityScanner() {
  // CORRECCIÓN: Usamos 'refreshProfile', que es como lo llamamos en el Contexto
  const { user, refreshProfile } = useAuth();
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processOCR = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validación básica de usuario
    if (!user) {
        setError("Debes iniciar sesión para subir documentos.");
        return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log("Procesando archivo:", file.name);
      
      // 1. Simulación de espera OCR (3 segundos)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 2. Actualización en Supabase
      // Cambiamos el estado a 'pending' para que el Admin lo revise
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ status: 'pending' }) 
        .eq('id', user.id);

      if (dbError) throw dbError;

      // 3. Actualizar estado global
      // Esto hará que la barra de navegación y el perfil cambien instantáneamente
      if (refreshProfile) await refreshProfile();

    } catch (err) {
      console.error(err);
      setError("Error al procesar. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-[#ff5f00] transition-colors cursor-pointer group">
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase group-hover:text-[#ff5f00]">Cara Frontal</p>
          <div className="text-4xl mb-2">🪪</div>
        </div>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-[#ff5f00] transition-colors cursor-pointer group">
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase group-hover:text-[#ff5f00]">Cara Trasera</p>
          <div className="text-4xl mb-2">💳</div>
        </div>
      </div>

      {isUploading ? (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff5f00] mb-3"></div>
          <p className="font-bold text-[#ff5f00] text-sm uppercase tracking-wide">Analizando documentos...</p>
          <p className="text-xs text-gray-400 mt-1">Esto puede tardar unos segundos</p>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block w-full text-center bg-black text-white py-4 rounded-xl font-bold cursor-pointer hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
            SUBIR DOCUMENTOS
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={processOCR}
            />
          </label>
          <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest">
            Aceptamos DNI, Pasaporte o Carnet de Conducir
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
}