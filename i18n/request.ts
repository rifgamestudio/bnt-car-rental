import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  // Next.js 15: Esperar el locale de la solicitud
  let locale = await requestLocale;

  // Si el locale no es válido o es null, usar el por defecto (en)
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale, // Devolver el locale explícitamente es obligatorio ahora
    messages: (await import(`../messages/${locale}.json`)).default
  };
});