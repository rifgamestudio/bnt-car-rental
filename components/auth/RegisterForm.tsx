// components/auth/RegisterForm.tsx
"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RegisterForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [msg, setMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // 1. Registro en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) return alert(error.message);

    // 2. Crear perfil con estado 'registered'
    await supabase.from('profiles').insert([
      { 
        id: data.user?.id, 
        full_name: formData.name, 
        phone: formData.phone, 
        status: 'registered' 
      }
    ]);

    setMsg("Registro exitoso. Ahora necesitamos verificar tu identidad para poder alquilar coches.");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Crea tu cuenta</h2>
      {msg ? (
        <div className="bg-blue-100 p-4 rounded text-blue-700">{msg}</div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <input className="w-full border p-2 rounded" placeholder="Nombre completo" onChange={e => setFormData({...formData, name: e.target.value})} />
          <input className="w-full border p-2 rounded" placeholder="Email" type="email" onChange={e => setFormData({...formData, email: e.target.value})} />
          <input className="w-full border p-2 rounded" placeholder="Teléfono" onChange={e => setFormData({...formData, phone: e.target.value})} />
          <input className="w-full border p-2 rounded" placeholder="Contraseña" type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
          <button className="w-full bg-orange-500 text-white p-2 rounded font-bold hover:bg-orange-600">
            Registrarse
          </button>
        </form>
      )}
    </div>
  );
}