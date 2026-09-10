import { NextResponse } from "next/server";
import { NextRequest } from 'next/server';
import { jwtVerify } from "jose";
import { verifyToken } from '@/lib/auth';

const secretKey = process.env.JWT_SECRET || 'super_gizli_ve_guclu_bir_anahtar_123456';
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/superadmin')) {
    if (pathname === '/superadmin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('superadmin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/superadmin/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, encodedKey);

      if (!payload || !(payload as any).isSuperAdmin) {
        throw new Error('Geçersiz SuperAdmin yetkisi.');
      }
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL('/superadmin/login', request.url));
      response.cookies.delete('superadmin_token');
      return response;
    }
  }

  if (pathname.includes('/dashboard')) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const userPayload = await verifyToken(token);
    if (!userPayload) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    const role = userPayload.role;
    const userSlug = (userPayload as any).slug; 

    if (pathname.startsWith('/dashboard') && userSlug) {
      const newPath = pathname.replace('/dashboard', `/${userSlug}/dashboard`);
      return NextResponse.redirect(new URL(newPath, request.url));
    }

    if (pathname.includes('/dashboard/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (pathname.includes('/dashboard/pm') && role !== 'PM' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (pathname.includes('/dashboard/developer') && role !== 'DEVELOPER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (pathname.includes('/dashboard/analyst') && role !== 'ANALYST' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/:slug/dashboard/:path*'],
};