import { NextResponse } from 'next/server';
import { getTenantPrisma, prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth'; 

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

    const existing = await db.project.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Proje bulunamadı' }, { status: 404 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });
    
    const plan = tenant?.plan || 'FREE';
    if (plan.toUpperCase() === 'FREE') {
      return NextResponse.json(
        { message: 'Çöp kutusundan geri yükleme özelliği sadece PRO planda mevcuttur. Lütfen yöneticinizle iletişime.' },
        { status: 403 }
      );
    }

    const restoredProject = await db.project.update({
      where: { id },
      data: { deletedAt: null },
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