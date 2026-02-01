import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

export default createMiddleware(routing);

export const config = {
  // Coincidir con todas las rutas excepto las internas de Next.js
  matcher: ['/', '/(en|fr|nl)/:path*']
};