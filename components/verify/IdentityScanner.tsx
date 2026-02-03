"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase'; 
import { useAuth } from '@/context/AuthContext';
import Tesseract from 'tesseract.js'; // Importamos el motor OCR real

export default function IdentityScanner() {
  const { user, refreshProfile } = useAuth();
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState(""); // Para mostrar qué está haciendo

  // Función para encontrar datos dentro del texto desordenado del OCR
  const parseOCRText = (text: string) => {
    // 1. Buscar Fechas (formato DD.MM.YYYY o DD/MM/YYYY o DD-MM-YYYY)
    // Busca 2 digitos + separador + 2 digitos + separador + 4 digitos
    const dateRegex = /\b\d{2}[./-]\d{2}[./-]\d{4}\b/g;
    const dates = text.match(dateRegex) || [];

    // Asumimos que la fecha de nacimiento suele ser la primera fecha encontrada en un DNI estándar
    // O buscamos palabras clave si queremos ser más precisos (ej: 'Né le', 'Birth')
    const birthDate = dates.length > 0 ? dates[0] : null;

    // 2. Buscar posible dirección (Líneas largas que contengan números y texto)
    // Esto es una aproximación, ya que las direcciones varían mucho
    const lines = text.split('\n').filter(line => line.length > 10);
    const address = lines.find(line => /\d/.test(line) && !line.includes(birthDate || ''));

    // 3. Buscar DNI (Patrón común: letras mayúsculas seguidas de números)
    const docRegex = /[A-Z]{1,2}\d{5,8}/;
    const docMatch = text.match(docRegex);
    const docNumber = docMatch ? docMatch[0] : null;

    return { birthDate, address, docNumber };
  };

  const processOCR = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
        setError("Debes iniciar sesión.");
        return;
    }

    setIsUploading(true);
    setError(null);
    setStatusMsg("Subiendo imagen...");

    try {
      // 1. SUBIR LA FOTO REAL A SUPABASE
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_front_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('user-documents') // Asegúrate de tener este bucket o usa 'cars' si no creaste otro
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtener URL para guardarla
      const { data: urlData } = supabase.storage
        .from('user-documents')
        .getPublicUrl(fileName);
      
      setStatusMsg("Analizando texto con IA...");

      // 2. EJECUTAR OCR (Leer el texto)
      const { data: { text } } = await Tesseract.recognize(
        file,
        'eng', // Puedes poner 'fra' si la mayoría son documentos franceses
      );

      console.log("Texto encontrado:", text); // Míralo en la consola (F12) para depurar
      const extracted = parseOCRText(text);

      setStatusMsg("Guardando datos...");

      // 3. GUARDAR EN BASE DE DATOS (En las columnas que confirmaste que existen)
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ 
          status: 'pending',
          id_card_front_url: urlData.publicUrl, // Guardamos la foto
          
          // Guardamos los datos extraídos
          extracted_birth_date: extracted.birthDate,
          extracted_address: extracted.address,
          extracted_doc_number: extracted.docNumber
        }) 
        .eq('id', user.id);

      if (dbError) throw dbError;

      // 4. Refrescar la app
      if (refreshProfile) await refreshProfile();

    } catch (err: any) {
      console.error(err);
      setError("Error: " + (err.message || "No se pudo procesar el documento."));
    } finally {
      setIsUploading(false);
      setStatusMsg("");
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
          <p className="font-bold text-[#ff5f00] text-sm uppercase tracking-wide">{statusMsg}</p>
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