"use client";
import React from 'react';
import { Link, usePathname } from '@/navigation';
import { Users, Car, Calendar, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const menuItems = [
    { name: 'Utilisateurs', href: '/admin/users', icon: Users },
    { name: 'Clients', href: '/admin/clients', icon: ShieldCheck },
    { name: 'Voitures', href: '/admin/cars', icon: Car },
    { name: 'Réservations', href: '/admin/bookings', icon: Calendar },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-[9999] w-64 bg-black border-r border-zinc-800 transition-transform duration-300 ease-in-out
      lg:sticky lg:translate-x-0 lg:h-screen
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-8">
        <h1 className="text-3xl font-black italic tracking-tighter text-[#ff5f00]">BNT ADMIN</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)} // Cierra el menú al hacer clic en móvil
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
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 w-full text-zinc-500 hover:text-red-500 transition-colors font-bold uppercase text-xs tracking-widest bg-transparent border-none"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}