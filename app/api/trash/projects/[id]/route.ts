import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        deletedAt: null,
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    await prisma.task.deleteMany({
      where: { projectId: id },
    });
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