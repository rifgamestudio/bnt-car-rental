"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import DocumentScanner from '../DocumentScanner'; // El que hicimos antes

export default function IdentityScanner() {
  const { updateStatus } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const handleOcrResult = async (data: any) => {
    setIsProcessing(true);
    updateStatus('pending');

    // PLACEHOLDER: Aquí llamarías a tu API de Backend para validar el texto
    // Simulación de proceso de 3 segundos
    setTimeout(() => {
      const isValid = Math.random() > 0.2; // 80% éxito simulación

      if (isValid) {
        updateStatus('verified');
        alert("✅ Verificación aprobada. Ya puedes reservar.");
      } else {
        updateStatus('registered');
        setErrorCount(prev => prev + 1);
        alert("❌ Error de lectura. Asegúrate de que haya buena luz y el documento esté centrado.");
      }
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl text-black">
      <h2 className="text-2xl font-bold mb-4">Verificación de Identidad</h2>
      
      {isProcessing ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="font-medium">Analizando documentos con IA...</p>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">Sube una foto clara de tu Pasaporte o Carnet de Conducir.</p>
          <DocumentScanner label="Documento de Identidad" onScanComplete={handleOcrResult} />
          
          {errorCount > 0 && (
            <p className="mt-4 text-red-500 text-sm font-bold">
              Intento fallido #{errorCount}. Por favor, evita reflejos en el plástico del carnet.
            </p>
          )}
        </>
      )}
    </div>
  );
}