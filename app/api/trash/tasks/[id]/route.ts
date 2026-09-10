import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getTenantPrisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const db = getTenantPrisma(user.tenantId);

    const existingTask = await db.task.findFirst({ where: { id } });
    if (!existingTask) {
      return NextResponse.json({ message: 'Görev bulunamadı' }, { status: 404 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });
    
    const plan = tenant?.plan || 'FREE';
    if (plan.toUpperCase() === 'FREE') {
      return NextResponse.json(
        { message: 'Çöp kutusundan geri yükleme özelliği sadece PRO planda mevcuttur. Lütfen planınızı yükseltin.' },
        { status: 403 }
      );
    }

    const restoredTask = await db.task.update({
      where: { id },
      data: { deletedAt: null },
    });

    return NextResponse.json(restoredTask);
  } catch (error: any) {
    console.error('Görev geri yükleme hatası:', error);
    return NextResponse.json(
      { message: 'Görev geri yüklenemedi', error: error.message },
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

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Görev kalıcı olarak silindi' });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Görev kalıcı olarak silinemedi', error: error.message },
      { status: 500 }
    );
  }
}