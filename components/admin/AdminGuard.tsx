"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== 'admin') {
      router.push("/"); // Si no es admin, fuera a la home
    }
  }, [role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-black italic animate-pulse">BNT ADMIN - VERIFICANDO...</div>
      </div>
    );
  }

  return role === 'admin' ? <>{children}</> : null;
}