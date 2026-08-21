import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
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

    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Geçersiz e-posta veya şifre' }, { status: 401 });
    }
    const dbPassword = (user as any).password || (user as any).passwordHash || '';

    let isPasswordCorrect = false;
    if (dbPassword.startsWith('$2a$') || dbPassword.startsWith('$2b$') || dbPassword.startsWith('$2y$')) {
      isPasswordCorrect = await bcrypt.compare(password, dbPassword);
    } else {
      isPasswordCorrect = dbPassword === password;
    }

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Geçersiz e-posta veya şifre' }, { status: 401 });
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || '',
    });

    const response = NextResponse.json({
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, 
    });

    return response;
  } catch (error: any) {
    console.error('Login Hatası:', error);
    return NextResponse.json({ message: 'Sunucu hatası: ' + (error?.message || '') }, { status: 500 });
  }
}