"use client";

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Menu, X } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    /* admin-layout-container activa la regla de globals.css para ocultar la Navbar pública */
    <div className="admin-layout-container flex min-h-screen bg-black text-white">
      
      {/* Botón hamburguesa naranja para móvil */}
      <div className="lg:hidden fixed top-4 left-4 z-[10001]">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 bg-[#ff5f00] rounded-xl shadow-lg text-white active:scale-95 transition-all"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Sombra de fondo cuando el menú está abierto en móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Contenido de las páginas admin */}
      <main className="flex-1 w-full p-4 md:p-8 pt-20 lg:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto text-white">
          {children}
        </div>
      </main>
    </div>
  );
}