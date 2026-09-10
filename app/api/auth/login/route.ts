import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const { email, password} = await request.json();

    const ip = request.headers.get('x-forwarded-for') || 'local-user';
    const isAllowed = checkRateLimit(`login-${ip}`, 5, 60 * 1000);

    if (!isAllowed) {
      return NextResponse.json(
        { message: 'Çok fazla başarısız deneme yaptınız. Lütfen 1 dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    if (!email || !password) {
      return NextResponse.json({ message: 'E-posta ve şifre zorunludur' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email,
        deletedAt:null
      },
      include: {
        tenant: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'Geçersiz e-posta veya şifre' }, { status: 401 });
    }

    if(user.tenant && user.tenant.isActive === false){
      return NextResponse.json(
        {message: 'Giriş yapamazsınız, şirketiniz pasif durumda!'},
        {status:403}
      );
    }

    if(user.isActive === false) {
      return NextResponse.json(
        {message: 'Hesabınız pasife alınmış. Lütfen yöneticinizle iletişime geçin.'},
        {status:403}
      );
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

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });
    const tenantSlug = tenant ? tenant.slug : '';

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || '',
      tenantId: user.tenantId,
      slug: tenantSlug,
    });

    const response = NextResponse.json({
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        name: user.name,
        email: user.email || user.email.split('@')[0],
        role: user.role,
        slug: tenantSlug,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, 
    });
    response.cookies.delete('superadmin_token');

    return response;
  } catch (error: any) {
    console.error('Login Hatası:', error);
    return NextResponse.json({ message: 'Sunucu hatası: ' + (error?.message || '') }, { status: 500 });
  }
}