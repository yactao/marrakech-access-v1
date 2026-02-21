import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent d'être connecté
const PROTECTED_ROUTES = ['/admin', '/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();

  // Vérifier le cookie access_token posé par le backend (httpOnly)
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
