import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { superadminToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rateLimit';


export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'local-user';
    const isAllowed = checkRateLimit(`login-${ip}`, 5, 60 * 1000);

    if (!isAllowed) {
      return NextResponse.json(
        { message: 'Çok fazla başarısız deneme yaptınız. Lütfen 1 dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }
    const body = await request.json();
    const email = body.email?.trim();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json({ message: 'E-posta ve şifre zorunludur' }, { status: 400 });
    }

    const superAdmin = await prisma.superAdmin.findFirst({
      where: {
        email: email,
      },
    });

    if (!superAdmin) {
      return NextResponse.json({ message: 'Geçersiz e-posta veya şifre' }, { status: 401 });
    }
    const dbPassword = (superAdmin as any).password || (superAdmin as any).passwordHash || '';

    let isPasswordCorrect = false;
    if (dbPassword.startsWith('$2a$') || dbPassword.startsWith('$2b$') || dbPassword.startsWith('$2y$')) {
      isPasswordCorrect = await bcrypt.compare(password, dbPassword);
    } else {
      isPasswordCorrect = dbPassword === password;
    }

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Geçersiz e-posta veya şifre' }, { status: 401 });
    }

    const token = await superadminToken({
      id: superAdmin.id,
      email: superAdmin.email,
      name: superAdmin.name || '',  
      isSuperAdmin: true,    
    });

    const response = NextResponse.json({
      message: 'Giriş başarılı',
      superAdmin: {
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email || superAdmin.email.split('@')[0],
      },
    });

    response.cookies.set({
      name: 'superadmin_token',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production', 
      path: '/',
      
    });
    response.cookies.delete('auth_token');

    return response;
  } catch (error: any) {
    console.error('Login Hatası:', error);
    return NextResponse.json({ message: 'Sunucu hatası: ' + (error?.message || '') }, { status: 500 });
  }
}