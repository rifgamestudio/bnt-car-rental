"use client";
import React from 'react';
// Importamos usePathname nativo de Next.js para evitar conflictos de Intl
import { usePathname } from 'next/navigation';
import { Link } from '@/navigation';
import { Users, Car, Calendar, LogOut, ShieldCheck, Home, Mail } from 'lucide-react';
// CORRECCIÓN CLAVE: Usamos la ruta relativa para que coincida con el Provider del Root Layout
import { useAuth } from '../../context/AuthContext'; 

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { signOut, role } = useAuth(); // Usamos el hook con la importación unificada

  const menuItems = [
    { name: 'Utilisateurs', href: '/admin/users', icon: Users },
    { name: 'Clients', href: '/admin/clients', icon: ShieldCheck },
    { name: 'Voitures', href: '/admin/cars', icon: Car },
    { name: 'Réservations', href: '/admin/bookings', icon: Calendar },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-[10002] w-64 bg-black border-r border-zinc-800 transition-transform duration-300 ease-in-out
      lg:sticky lg:translate-x-0 lg:h-screen flex flex-col
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-8">
        <Link href="/" className="no-underline block mb-2">
            <img src="/logo.png" alt="BNT Logo" className="h-10 w-auto object-contain" />
        </Link>
        <h1 className="text-xl font-black italic tracking-tighter text-[#ff5f00]">BNT ADMIN</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 ml-4">Gestion</p>
        {menuItems.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all no-underline ${
                isActive 
                ? 'bg-[#ff5f00] text-white shadow-[0_0_20px_rgba(255,95,0,0.3)]' 
                : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="uppercase text-xs tracking-widest">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-8 space-y-2">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 ml-4">Général</p>
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-zinc-500 hover:text-white no-underline transition-all">
            <Home className="w-5 h-5" />
            <span className="uppercase text-xs tracking-widest">Accueil</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 w-full text-zinc-500 hover:text-red-500 transition-colors font-bold uppercase text-xs tracking-widest bg-transparent border-none cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}