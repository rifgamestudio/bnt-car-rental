import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "./../globals.css";
import Navbar from '@/components/Navbar';
import { AuthProvider } from './../../context/AuthContext'; // Importamos el contexto

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // En Next.js 15, params DEBE ser esperado con await
  const { locale } = await props.params;
  
  // Cargamos los mensajes de traducción
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased bg-[#0a0a0a] text-white">
        <NextIntlClientProvider messages={messages}>
          {/* El AuthProvider envuelve todo el contenido */}
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                {props.children}
              </main>
              {/* Aquí podrías añadir un Footer más adelante */}
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}