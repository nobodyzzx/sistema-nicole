import type { APIRoute } from 'astro';
export const prerender = false;

const AUTH_COOKIE = 'scu_auth';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(AUTH_COOKIE, { path: '/' });
  return redirect('/login');
};
