"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BookingGuard({ children }: { children: React.ReactNode }) {
  // CAMBIO AQUÍ: de isLoading a loading
  const { status, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && status !== 'verified') {
      router.push('/profile');
    }
  }, [status, loading, router]);

  // CAMBIO AQUÍ TAMBIÉN
  if (loading) return <div className="p-20 text-center text-white font-bold uppercase tracking-widest animate-pulse">Chargement...</div>;

  return status === 'verified' ? <>{children}</> : null;
}