import type { APIContext, MiddlewareNext } from 'astro';
import { defineMiddleware } from 'astro/middleware';

const AUTH_COOKIE = 'scu_auth';

// Rutas públicas (solo login y assets)
const PUBLIC_PATHS = new Set(['/login', '/favicon.ico']);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/api/login')) return true;
  if (pathname.startsWith('/api/logout')) return true;
  // static and dev assets
  if (pathname.startsWith('/public')) return true;
  if (pathname.startsWith('/_astro')) return true;
  if (pathname.startsWith('/_image')) return true;
  if (pathname.startsWith('/assets')) return true;
  if (pathname.startsWith('/@fs')) return true;
  if (pathname.startsWith('/node_modules')) return true;
  if (pathname.startsWith('/src')) return true;
  return false;
}

export const onRequest = defineMiddleware(
  async (context: APIContext, next: MiddlewareNext) => {
    const { url, cookies } = context;
    const pathname = (typeof url === 'string' ? new URL(url) : url).pathname;

    // Permitir assets y rutas de autenticación
    if (isPublicPath(pathname)) {
      return next();
    }

    // Todas las demás rutas requieren autenticación
    const token = cookies.get(AUTH_COOKIE)?.value;
    if (!token) {
      return context.redirect('/login');
    }

    return next();
  }
);
