// components/verify/IdentityScanner.tsx
"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Asegúrate de que la ruta sea correcta
import { useAuth } from '@/context/AuthContext';

export default function IdentityScanner() {
  const { user, refreshStatus } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processOCR = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // 1. SIMULACIÓN DE LLAMADA API OCR
      // Aquí es donde harías: const res = await fetch('/api/ocr', { body: formData... })
      console.log("Procesando archivo:", file.name);
      
      // Simulamos espera de 3 segundos del servidor OCR
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 2. ACTUALIZACIÓN EN SUPABASE
      // Actualizamos el estado del usuario a 'pending' (o 'verified' si el OCR es automático)
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ status: 'pending' }) // Lo ponemos en espera de revisión
        .eq('id', user?.id);

      if (dbError) throw dbError;

      // 3. ACTUALIZAR ESTADO GLOBAL
      if (refreshStatus) await refreshStatus();

    } catch (err) {
      setError("No pudimos procesar la imagen. Asegúrate de que sea clara y se vea todo el documento.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-orange-300 transition-colors">
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Cara Frontal</p>
          <div className="text-2xl mb-2">🪪</div>
        </div>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-orange-300 transition-colors">
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Cara Trasera</p>
          <div className="text-2xl mb-2">💳</div>
        </div>
      </div>

      {isUploading ? (
        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
          <p className="font-semibold text-orange-600">Analizando documentos con IA...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block w-full text-center bg-black text-white py-4 rounded-xl font-bold cursor-pointer hover:bg-zinc-800 transition-all">
            SUBIR DOCUMENTOS O CAPTURAR
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={processOCR}
            />
          </label>
          <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest">Aceptamos DNI, Pasaporte o Carnet de Conducir</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}