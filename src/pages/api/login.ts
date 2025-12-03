export const prerender = false;
import type { APIRoute } from 'astro';

const AUTH_COOKIE = 'scu_auth';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Simple demo user. Replace with real user store later.
const DEMO_USER = {
  email: 'demo@mlp.com',
  password: 'mlp123',
};

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') || '')
    .trim()
    .toLowerCase();
  const password = String(form.get('password') || '');

  if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
    return redirect(
      `/login?error=${encodeURIComponent('Credenciales inválidas')}`
    );
  }

  // Demo token simple (sin JWT) para evitar errores de librerías en SSR.
  const token = Buffer.from(JSON.stringify({ email, t: Date.now() })).toString(
    'base64url'
  );
  cookies.set(AUTH_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // set true behind HTTPS
    maxAge: 60 * 60 * 24 * 2,
  });
  return redirect('/');
};
