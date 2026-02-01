import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

// 1. Definimos la configuración de las rutas
export const routing = defineRouting({
  locales: ['en', 'fr', 'nl'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

// 2. Exportamos los hooks de navegación corregidos
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);