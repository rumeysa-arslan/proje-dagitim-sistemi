import { NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const currentUserReq = await getCurrentUser();
    if (!currentUserReq || !currentUserReq.tenantId) {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const db = getTenantPrisma(currentUserReq.tenantId);
    const { id } = await params;

    let body: any = {};
    try {
      body = await request.json();
    } catch {
    }
    const currentUser = await db.user.findFirst({
      where: { id },
    });

    if (!currentUser) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    const nextStatus = typeof body.isActive === 'boolean' ? body.isActive : !currentUser.isActive;

    const updatedUser = await db.user.update({
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