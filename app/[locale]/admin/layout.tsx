"use client";

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Menu, X } from 'lucide-react'; // Iconos para el toggle

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* BOTÓN HAMBURGUESA (Solo visible en móviles) */}
      <div className="lg:hidden fixed top-4 left-4 z-[10001]">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-[#ff5f00] rounded-lg shadow-lg text-white"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR: Le pasamos el estado para que sepa cuándo mostrarse */}
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* OVERLAY: Fondo oscuro cuando el menú está abierto en móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 w-full lg:ml-0 p-4 md:p-8 pt-20 lg:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}