import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Tus 3 idiomas
  locales: ['en', 'fr', 'nl'],
  
  // Idioma por defecto si no detecta ninguno
  defaultLocale: 'en',
  
  // Forzar que siempre aparezca el prefijo en la URL (ej: /en/login)
  localePrefix: 'always'
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);