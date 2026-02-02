// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Extraemos las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validación de seguridad para que la app no dé error genérico en Vercel
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ ATENCIÓN: Las variables de entorno de Supabase no están configuradas correctamente. " +
    "Asegúrate de añadirlas en el panel de Vercel (Settings > Environment Variables)."
  );
}

// Creamos el cliente de Supabase
// Usamos un string vacío como fallback para que createClient no falle al inicializarse
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);