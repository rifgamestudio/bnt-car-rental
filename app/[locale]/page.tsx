"use client"; // Necesario para usar funciones de clic

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import SearchWidget from "@/components/SearchWidget";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);

  // 1. Verificamos si hay un usuario al cargar la página
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  // 2. Función para iniciar sesión con Google
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Esto redirige al usuario de vuelta a la web después del login
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error("Error:", error.message);
  };

  // 3. Función para cerrar sesión
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <main className="w-full flex flex-col bg-[#f3f4f6] min-h-screen">
      
      {/* BARRA DE ESTADO DE PRUEBA (Solo para saber si funciona) */}
      <div className="bg-yellow-100 p-2 text-center text-xs text-black font-bold border-b border-yellow-200">
        {user ? (
          <p>✅ Conectado como: {user.email} | <button onClick={logout} className="underline text-red-600">Cerrar sesión</button></p>
        ) : (
          <p>❌ Usuario no identificado | <button onClick={loginWithGoogle} className="underline text-blue-600">Probar Login con Google ahora</button></p>
        )}
      </div>

      {/* Sección Hero (Superior) */}
      <div className="relative w-full h-[550px] flex flex-col items-center pt-14 px-6">
        <div className="relative z-50 w-full flex justify-center">
          <SearchWidget />
        </div>

        <div className="absolute bottom-[-50px] w-full max-w-[1000px] z-40 flex justify-center pointer-events-none">
          <img 
            src="https://www.sixt.es/fileadmin/files/global/user_upload/fleet/png/350x200/bmw-x5-5d-black-2023.png" 
            alt="BMW BNT" 
            className="w-[85%] h-auto object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.12)]"
          />
        </div>
      </div>

      {/* Sección Inferior (Naranja) */}
      <div className="w-full bg-[#ff5f00] pt-36 pb-28 flex flex-col items-center text-center px-6 relative z-10">
        <h2 className="text-black text-[50px] md:text-[90px] font-[1000] leading-[0.8] tracking-tighter uppercase mb-8">
          ALQUILA PREMIUM. <br />
          PAGA ECONOMY.
        </h2>
      </div>
    </main>
  );
}