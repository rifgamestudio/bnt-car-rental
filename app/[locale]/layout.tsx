import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '../../context/AuthContext'; // <--- IMPORTACIÓN UNIFICADA
import "./../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className="antialiased bg-[#0a0a0a] text-white">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <div className="public-element">
                <Navbar />
              </div>

              <main className="flex-grow">
                {props.children}
              </main>

              <div className="public-element">
                {/* Opcional: Footer si lo tienes */}
                <Footer />
              </div>
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}