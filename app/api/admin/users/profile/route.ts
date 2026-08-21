import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const { userId, skills } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: 'Kullanıcı ID gereklidir.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { skills },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Yetenekler güncellenemedi.' }, { status: 500 });
  }
}