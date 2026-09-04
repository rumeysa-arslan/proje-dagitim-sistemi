import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date()  },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Kullanıcı silinemedi:', error);
    return NextResponse.json(
      { message: 'Kullanıcı silinirken hata oluştu', error: error.message },
      { status: 500 }
    );
  }
}