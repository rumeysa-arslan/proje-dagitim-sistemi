import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    let body: any = {};
    try {
      body = await request.json();
    } catch {
    }
    const currentUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!currentUser) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    const nextStatus = typeof body.isActive === 'boolean' ? body.isActive : !currentUser.isActive;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: nextStatus,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Kullanıcı durumu güncellenemedi:', error);
    return NextResponse.json(
      { message: 'Durum güncellenirken hata oluştu', error: error.message },
      { status: 500 }
    );
  }
}