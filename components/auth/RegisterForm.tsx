"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterForm() {
  const { login } = useAuth();
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de llamada a Supabase Auth
    const mockUser = { id: '123', name: 'Juan BNT', email: 'juan@bnt.com', status: 'registered' as const };
    login(mockUser);
    setStep(2);
  };

  if (step === 2) {
    return (
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 text-center">
        <h3 className="text-xl font-bold text-blue-800">¡Registro exitoso! 🎉</h3>
        <p className="text-blue-600 mt-2">
          Para garantizar la seguridad, necesitamos verificar tu identidad antes de que puedas alquilar un coche.
        </p>
        <button 
          onClick={() => window.location.href = '/verify'}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
        >
          Ir a verificar mi identidad
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg text-black">
      <h2 className="text-2xl font-black italic mb-6">ÚNETE A BNT</h2>
      <input type="text" placeholder="Nombre completo" className="w-full p-3 border rounded-lg" required />
      <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" required />
      <input type="tel" placeholder="Teléfono (+34...)" className="w-full p-3 border rounded-lg" required />
      <input type="password" placeholder="Contraseña" className="w-full p-3 border rounded-lg" required />
      <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">
        CREAR CUENTA
      </button>
    </form>
  );
}