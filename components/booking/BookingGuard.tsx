// components/booking/BookingGuard.tsx
"use client";
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function BookingGuard({ children }: { children: React.ReactNode }) {
  const { status, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;

  if (status !== 'verified') {
    return (
      <div className="p-10 text-center bg-orange-50 rounded-xl border border-orange-200">
        <h2 className="text-2xl font-bold text-orange-800">Acceso Restringido</h2>
        <p className="my-4 text-orange-700">
          {status === 'registered' 
            ? "Para realizar una reserva, primero debes verificar tu identidad." 
            : "Tu verificación está en proceso. Te avisaremos pronto."}
        </p>
        {status === 'registered' && (
          <Link href="/verify" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold">
            Verificar ahora
          </Link>
        )}
      </div>
    );
  }

  return <>{children}</>;
}