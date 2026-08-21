import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ♻️ Geri Yükle (PATCH)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const restoredUser = await prisma.user.update({
      where: { id },
      data: {
        deletedAt: null, // deletedAt'i temizleyerek çöp kutusundan çıkarıyoruz
        isActive: true,
      },
    });

    return NextResponse.json(restoredUser);
  } catch (error: any) {
    console.error('Geri yükleme hatası:', error);
    return NextResponse.json(
      { message: 'Kullanıcı geri yüklenemedi', error: error.message },
      { status: 500 }
    );
  }
}

// 💥 Kalıcı Sil (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Veritabanından tamamen kaldırıyoruz
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Kullanıcı kalıcı olarak silindi' });
  } catch (error: any) {
    console.error('Kalıcı silme hatası:', error);
    return NextResponse.json(
      { message: 'Kullanıcı kalıcı olarak silinemedi', error: error.message },
      { status: 500 }
    );
  }
}