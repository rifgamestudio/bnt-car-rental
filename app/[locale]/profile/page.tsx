// app/[locale]/profile/page.tsx
"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import IdentityScanner from '@/components/verify/IdentityScanner';

export default function ProfilePage() {
  const { user, status } = useAuth();

  if (!user) return <div className="p-20 text-center">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1240px] mx-auto py-12 px-4">
        
        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Panel de Cliente</h1>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-2">Gestiona tu identidad y alquileres</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* INFO DE USUARIO */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-2xl font-black">
                {user.name?.charAt(0)}
              </div>
              <div>
                <h2 className="font-black text-xl leading-none">{user.name}</h2>
                <p className="text-gray-400 text-xs mt-1 font-bold">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Estado de Verificación</span>
                <div className={`mt-1 py-2 px-4 rounded-lg font-black text-[12px] text-center uppercase ${
                  status === 'verified' ? 'bg-green-100 text-green-700' :
                  status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                }`}>
                  {status === 'verified' ? '✓ Cuenta Verificada' : 
                   status === 'pending' ? '⌛ En Revisión' : '⚠ Acción Requerida'}
                </div>
              </div>
            </div>
          </div>

          {/* ÁREA DE ACCIÓN (OCR O ÉXITO) */}
          <div className="lg:col-span-2">
            {status === 'verified' ? (
              <div className="bg-white p-10 rounded-2xl border-2 border-green-500 shadow-xl">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl text-green-600">✓</span>
                </div>
                <h3 className="text-2xl font-black mb-2 uppercase italic">¡Todo listo, {user.name}!</h3>
                <p className="text-gray-600 font-medium">Tu identidad ha sido verificada con éxito. Ahora tienes acceso completo a nuestra flota Premium y puedes realizar reservas inmediatamente.</p>
                <button className="mt-8 bg-[#ff5f00] text-white px-10 py-4 rounded-xl font-black hover:scale-105 transition-transform">
                  EXPLORAR COCHES
                </button>
              </div>
            ) : (
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-8">
                  <h3 className="text-2xl font-black uppercase italic mb-2">Verificación de Identidad</h3>
                  <p className="text-gray-500 text-sm font-medium">Sube una foto clara de tus documentos para activar tu cuenta. Nuestro sistema OCR extraerá los datos automáticamente.</p>
                </div>
                
                {/* Aquí va el componente que maneja la cámara/archivos */}
                <IdentityScanner />
                
                {status === 'pending' && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm font-bold text-center">
                    Estamos analizando tus documentos. Este proceso suele tardar pocos minutos.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}