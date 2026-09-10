import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ message: 'Geçersiz istek veya yetersiz şifre.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        inviteToken: token,
        inviteTokenExpiry: { gt: new Date() }, 
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Geçersiz veya süresi dolmuş onay linki.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        inviteToken: null, 
        inviteTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Şifreniz başarıyla belirlendi.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Hata oluştu.' }, { status: 500 });
  }
}