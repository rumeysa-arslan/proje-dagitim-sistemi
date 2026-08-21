import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ♻️ Görevi Geri Yükle (Restore)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const restoredTask = await prisma.task.update({
      where: { id },
      data: { isDeleted: false },
    });

    return NextResponse.json(restoredTask);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Görev geri yüklenemedi', error: error.message },
      { status: 500 }
    );
  }
}

// 💥 Görevi Veritabanından Tamamen Sil (Hard Delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Görev kalıcı olarak silindi' });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Kalıcı silme hatası', error: error.message },
      { status: 500 }
    );
  }
}