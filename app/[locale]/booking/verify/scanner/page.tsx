"use client";

import React, { useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl'; // AÑADIDO: useLocale
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import DocumentScanner from '@/components/verify/DocumentScanner';
// AÑADIDO: Camera a los imports
import { AlertCircle, Plane, Loader2, Upload, Camera } from 'lucide-react'; 

function ScannerContent() {
  const t = useTranslations('Verify');
  const locale = useLocale(); // AÑADIDO: Para detectar el idioma del cliente
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth(); // AÑADIDO: extraemos profile para el nombre
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const origin = searchParams.get('origin');
  const bookingId = searchParams.get('id');

  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flightNumber, setFlightNumber] = useState("");
  
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  // NUEVO ESTADO: Para controlar si estamos usando la cámara en el paso de vuelo
  const [isScanningFlight, setIsScanningFlight] = useState(false);

  const steps = origin === 'maroc' 
    ? [t('cin_front'), t('cin_back'), t('license_front'), t('license_back')] 
    : [t('passport'), t('license_front'), t('license_back'), 'FLIGHT'];

  // NUEVA FUNCIÓN: Enviar email de "Petición Recibida" mediante Resend
  const sendReceivedEmail = async () => {
    try {
      // 1. Buscamos el nombre del coche para el email
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('cars(brand, model)')
        .eq('id', bookingId)
        .single();

      const carName = bookingData?.cars 
        ? `${(bookingData.cars as any).brand} ${(bookingData.cars as any).model}` 
        : "Véhicule BNT";

      // 2. Llamada a la API de envío
      await fetch('/api/send-received', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          customerName: profile?.full_name || user?.user_metadata?.full_name || "Client",
          carName: carName,
          locale: locale
        })
      });
    } catch (e) {
      console.error("Erreur envoi email reception:", e);
    }
  };

  // FUNCIÓN PARA SUBIR LA FOTO A SUPABASE STORAGE (CÁMARA)
  const uploadToSupabase = async (imageData: string, fileName: string) => {
    if (!user) return null;
    
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const blob = await (await fetch(`data:image/jpeg;base64,${base64Data}`)).blob();

    const filePath = `${user.id}/${Date.now()}_${fileName}.jpg`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, blob);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
    return publicUrl;
  };

  // NUEVA FUNCIÓN: MANEJO DEL ESCANEO DE VUELO (CÁMARA)
  const handleFlightScan = async (imageData: string) => {
    setIsProcessing(true);
    try {
      // 1. Subir la imagen
      const publicUrl = await uploadToSupabase(imageData, 'flight_ticket_cam');
      
      // 2. Actualizar la reserva
      await supabase.from('bookings').update({ 
        flight_number: flightNumber || 'SCANNED_CAM',
      }).eq('id', bookingId);

      // 3. Enviar Notificación Email
      await sendReceivedEmail();

      // 4. Redirigir
      router.push(`/booking/complete?id=${bookingId}`);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'envoi de la photo.");
      setIsScanningFlight(false); 
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlightUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}_flight_ticket.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
      
      await supabase.from('bookings').update({ 
        flight_number: flightNumber || 'FILE_UPLOADED',
      }).eq('id', bookingId);
      
      // Enviar Notificación Email
      await sendReceivedEmail();

      router.push(`/booking/complete?id=${bookingId}`);

    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'envoi du fichier.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleScanComplete = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/verify/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();

      if (data.error === 'no_document_found') {
        setError(t('error_no_doc'));
        setIsProcessing(false);
        return;
      }

      if (steps[step] === t('license_front')) {
        if (data.issueDate) {
          const issueDate = new Date(data.issueDate);
          const today = new Date();
          const twoYearsInMs = 2 * 365 * 24 * 60 * 60 * 1000;
          if ((today.getTime() - issueDate.getTime()) < twoYearsInMs) {
            setError(t('error_seniority'));
            setIsProcessing(false);
            return;
          }
        }
      }

      const currentDocName = steps[step];
      let columnUrl = "";
      const profileUpdates: any = {}; 

      if (currentDocName === t('cin_front')) columnUrl = "id_card_front_url";
      if (currentDocName === t('cin_back')) columnUrl = "id_card_back_url";
      if (currentDocName === t('passport')) columnUrl = "passport_url";
      if (currentDocName === t('license_front')) columnUrl = "license_front_url";
      if (currentDocName === t('license_back')) columnUrl = "license_back_url";

      if (columnUrl && user) {
        const publicUrl = await uploadToSupabase(imageData, columnUrl);
        profileUpdates[columnUrl] = publicUrl;

        if (data.fullName) profileUpdates.extracted_full_name = data.fullName;
        
        if (currentDocName === t('cin_front') || currentDocName === t('passport')) {
           if (data.documentNumber) profileUpdates.extracted_doc_number = data.documentNumber;
        }

        if (currentDocName === t('license_front')) {
           if (data.documentNumber) profileUpdates.extracted_license_number = data.documentNumber;
           if (data.issueDate) profileUpdates.extracted_license_date = data.issueDate;
        }

        await supabase.from('profiles').update(profileUpdates).eq('id', user.id);
      }

      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        // Fin para origen 'maroc'
        await sendReceivedEmail();
        router.push(`/booking/complete?id=${bookingId}`);
      }
    } catch (err: any) {
      setError(t('error_generic'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 w-8 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#d4af37]' : 'bg-zinc-800'}`} />
            ))}
          </div>
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            {t('doc_step', { current: step + 1, total: steps.length })}
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <p className="text-xs font-bold uppercase tracking-tight leading-tight">{error}</p>
          </div>
        )}

        {steps[step] === 'FLIGHT' ? (
          isScanningFlight ? (
             <DocumentScanner 
                label="SCANNER LE BILLET" 
                onScanComplete={handleFlightScan} 
                isProcessing={isProcessing} 
             />
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-10 text-center shadow-2xl">
              <Plane size={40} className="text-[#d4af37] mx-auto mb-6" />
              <h3 className="text-white font-black uppercase italic text-2xl mb-2">{t('flight_title')}</h3>
              <p className="text-zinc-500 text-xs font-bold uppercase mb-10 tracking-widest">{t('flight_desc')}</p>
              
              <input 
                type="text" 
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                placeholder={t('flight_placeholder')}
                className="w-full bg-black border border-zinc-800 rounded-2xl py-6 px-6 text-white text-center font-black text-3xl outline-none focus:border-[#d4af37] transition-all mb-6"
              />
              
              <button 
                onClick={async () => {
                  setIsProcessing(true);
                  await supabase.from('bookings').update({ flight_number: flightNumber }).eq('id', bookingId);
                  await sendReceivedEmail(); // Enviar notificación email
                  router.push(`/booking/complete?id=${bookingId}`);
                }}
                disabled={!flightNumber || flightNumber.length < 3 || isProcessing}
                className="w-full bg-[#d4af37] text-black py-6 rounded-2xl font-[1000] uppercase text-xs tracking-[0.3em] active:scale-95 transition-all disabled:opacity-30 mb-4"
              >
                {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : t('btn_finalize')}
              </button>

              <div className="relative flex py-4 items-center">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="flex-shrink-0 mx-4 text-zinc-600 text-[9px] font-black uppercase">OPTIONS DE BILLET</span>
                  <div className="flex-grow border-t border-zinc-800"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFlightUpload} 
                  accept=".pdf,image/*" 
                  className="hidden" 
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-zinc-700 hover:border-white text-zinc-400 hover:text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex flex-col items-center justify-center gap-2"
                >
                  {isUploadingFile ? <Loader2 className="animate-spin" size={14}/> : <Upload size={14} />}
                  <span>IMPORTER</span>
                </button>

                <button 
                  onClick={() => setIsScanningFlight(true)}
                  className="w-full border border-zinc-700 hover:border-[#d4af37] text-zinc-400 hover:text-[#d4af37] py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex flex-col items-center justify-center gap-2"
                >
                  <Camera size={14} />
                  <span>SCANNER</span>
                </button>
              </div>

            </div>
          )
        ) : (
          <DocumentScanner label={steps[step]} onScanComplete={handleScanComplete} isProcessing={isProcessing} />
        )}
      </div>
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ScannerContent />
    </Suspense>
  );
}