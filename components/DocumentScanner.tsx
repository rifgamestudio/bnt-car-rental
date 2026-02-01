"use client";

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';

interface ScannerProps {
  onScanComplete: (data: any) => void;
  label: string;
}

export default function DocumentScanner({ onScanComplete, label }: ScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Configuración de la cámara trasera para móviles
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment" // Fuerza la cámara trasera
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      processImage(imageSrc);
    }
  }, [webcamRef]);

  const processImage = async (imageSrc: string) => {
    setLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(
        imageSrc,
        'eng', // Puedes cambiar a 'fra' o 'nld' según el documento
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      // Aquí enviamos el texto extraído para procesarlo
      // En un caso real, usaríamos Regex para buscar "Passport No", "Date of Birth", etc.
      console.log("Texto extraído:", text);
      onScanComplete({ rawText: text, image: imageSrc });
      
    } catch (error) {
      console.error("Error en OCR:", error);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <h3 className="text-lg font-bold mb-4">{label}</h3>
      
      {!image ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full max-w-md rounded-lg"
          />
          <button
            onClick={capture}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg active:scale-95 transition"
          >
            📸 Capture & Scan
          </button>
        </>
      ) : (
        <div className="w-full max-w-md text-center">
          <img src={image} alt="Captured" className="rounded-lg mb-4" />
          {loading ? (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all" 
                style={{ width: `${progress}%` }}
              ></div>
              <p className="mt-2 text-sm text-gray-600">Processing Document... {progress}%</p>
            </div>
          ) : (
            <button
              onClick={() => setImage(null)}
              className="text-red-500 underline text-sm"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}