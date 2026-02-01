import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// 1. Idiomas soportados
const locales = ['en', 'fr', 'nl'];

export default getRequestConfig(async ({ requestLocale }) => {
  // 2. Esperamos el locale (es una Promesa en Next.js 15)
  const locale = await requestLocale;

  // 3. Validación de seguridad: Si no hay locale o no está en la lista, 404
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  return {
    // 4. Forzamos que locale sea tratado como string para que TS no se queje
    locale: locale as string,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});