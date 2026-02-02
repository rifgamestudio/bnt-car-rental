"use client";
import React from 'react';
import { Link, usePathname } from '@/navigation';
// AÑADIDO: ShieldCheck para la sección de clientes verificados
import { Users, Car, Calendar, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  // LISTA ACTUALIZADA: Separamos Usuarios de Clients y añadimos Réservations
  const menuItems = [
    { name: 'Utilisateurs', href: '/admin/users', icon: Users },      // El "limbo" (DNI por validar)
    { name: 'Clients', href: '/admin/clients', icon: ShieldCheck },   // Clientes verificados
    { name: 'Voitures', href: '/admin/cars', icon: Car },             // Gestión de flota
    { name: 'Réservations', href: '/admin/bookings', icon: Calendar }, // Gestión de reservas y asignación
  ];

  return (
    <aside className="w-64 bg-black h-screen sticky top-0 flex flex-col border-r border-zinc-800 text-white">
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
          className="flex items-center gap-3 px-4 py-3 w-full text-zinc-500 hover:text-red-500 transition-colors font-bold uppercase text-xs tracking-widest"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}