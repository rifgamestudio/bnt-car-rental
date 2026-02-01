"use client";
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, CheckCircle } from 'lucide-react';

export default function BookingGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  if (status === 'verified') {
    return <>{children}</>;
  }

  return (
    <div className="p-8 bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 text-center text-black">
      <ShieldAlert className="w-16 h-16 mx-auto text-orange-500 mb-4" />
      <h3 className="text-2xl font-black">ACCESO RESTRINGIDO</h3>
      <p className="text-gray-600 mt-2 mb-6">
        {status === 'pending' 
          ? "Estamos revisando tus documentos. Te avisaremos en breve."
          : "Para alquilar un coche en BNT, primero debes completar la verificación de identidad."}
      </p>
      
      {status === 'registered' && (
        <button 
          onClick={() => window.location.href = '/verify'}
          className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition"
        >
          VERIFICAR AHORA
        </button>
      )}
    </div>
  );
}