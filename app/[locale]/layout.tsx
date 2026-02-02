import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server'; // Importar setRequestLocale
import { notFound } from 'next/navigation';
import { routing } from '@/navigation';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import "./../globals.css";

// Generar rutas estáticas para rendimiento (Opcional pero recomendado)
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  // 1. Validar que el idioma existe, si no 404
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // 2. IMPORTANTE: Configurar el locale para este renderizado
  setRequestLocale(locale);

  // 3. Cargar los mensajes FORZANDO el locale actual
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className="antialiased bg-[#0a0a0a] text-white">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                {props.children}
              </main>
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}