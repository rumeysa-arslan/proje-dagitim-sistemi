import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'Kullanıcı ID gereklidir.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, skills: true },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Kullanıcı çekilemedi.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, skills } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: 'Kullanıcı ID zorunludur.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { skills },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Güncelleme başarısız oldu.' }, { status: 500 });
  }
}