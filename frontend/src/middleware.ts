import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent d'être connecté
const PROTECTED_ROUTES = ['/admin', '/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();

  // Vérifier le cookie logged_in posé par le frontend après connexion
  const loggedIn = request.cookies.get('logged_in')?.value;

  if (!loggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
