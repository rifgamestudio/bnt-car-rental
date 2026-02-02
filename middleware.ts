import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

export default createMiddleware(routing);

export const config = {
  // Matcher preciso para ignorar archivos internos, imágenes, etc.
  matcher: ['/', '/(en|fr|nl)/:path*']
};