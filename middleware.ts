import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth_token')?.value;

    // 1. Token yoksa direkt Login'e at
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 2. Token sahte mi / bozulmuş mu kontrol et
    const userPayload = await verifyToken(token);
    if (!userPayload) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    const role = userPayload.role;

    // 3. Yetki (Authorization) Kontrolleri
    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (pathname.startsWith('/dashboard/pm') && role !== 'PM' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (pathname.startsWith('/dashboard/developer') && role !== 'DEVELOPER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (pathname.startsWith('/dashboard/analyst') && role !== 'ANALYST' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};