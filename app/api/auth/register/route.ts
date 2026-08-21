import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, role } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ message: 'Lütfen tüm alanları doldurun.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu e-posta adresi ile zaten bir başvuru veya hesap bulunuyor.' },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role.toUpperCase(),
        isApproved: false,
        approvalStatus: 'PENDING',
        isActive: true,
      },
    });

    return NextResponse.json(
      { message: 'Başvurunuz alındı. Admin onayından sonra e-posta alacaksınız.' },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Kayıt başarısız.' }, { status: 500 });
  }
}