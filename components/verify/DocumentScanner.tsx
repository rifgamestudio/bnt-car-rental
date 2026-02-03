"use client";

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Loader2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ScannerProps {
  onScanComplete: (imageSrc: string) => void;
  label: string;
  isProcessing: boolean;
}

export default function DocumentScanner({ onScanComplete, label, isProcessing }: ScannerProps) {
  const t = useTranslations('Verify');
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      onScanComplete(imageSrc);
    }
  }, [webcamRef, onScanComplete]);

  // Lógica para subir archivo (PC/Móvil)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        onScanComplete(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-[2rem] p-6 flex flex-col items-center transition-all">
      <h3 className="text-[#d4af37] text-xs font-black uppercase tracking-[0.2em] mb-6">{label}</h3>
      
      {!image ? (
        <div className="flex flex-col items-center w-full">
          <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl mb-6">
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "environment" }} className="w-full h-full object-cover" />
            <button onClick={capture} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2">
              <Camera size={16} /> {t('scan_capture')}
            </button>
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="text-zinc-500 hover:text-[#d4af37] flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
            <Upload size={14} /> {t('upload_file')}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#d4af37]">
            <img src={image} alt="Captured" className="w-full h-auto" />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin mb-3" />
                <p className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.2em]">{t('scan_processing')}</p>
              </div>
            )}
          </div>
          {!isProcessing && (
            <button onClick={() => setImage(null)} className="mt-6 text-zinc-500 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
              <RefreshCw size={14} /> {t('scan_again')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}