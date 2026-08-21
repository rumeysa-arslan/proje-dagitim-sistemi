import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ♻️ Projeyi Geri Yükle (PATCH)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const restoredProject = await prisma.project.update({
      where: { id },
      data: {
        deletedAt: null, // deletedAt temizlenerek proje geri yüklenir
      },
    });

    return NextResponse.json(restoredProject);
  } catch (error: any) {
    console.error('Proje geri yükleme hatası:', error);
    return NextResponse.json(
      { message: 'Proje geri yüklenemedi', error: error.message },
      { status: 500 }
    );
  }
}

// 💥 Projeyi Kalıcı Olarak Sil (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Projeye bağlı görevler varsa önce onları temizleyelim
    await prisma.task.deleteMany({
      where: { projectId: id },
    });

    // Projeyi veritabanından kalıcı olarak sil
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Proje kalıcı olarak silindi' });
  } catch (error: any) {
    console.error('Proje kalıcı silme hatası:', error);
    return NextResponse.json(
      { message: 'Proje kalıcı olarak silinemedi', error: error.message },
      { status: 500 }
    );
  }
}