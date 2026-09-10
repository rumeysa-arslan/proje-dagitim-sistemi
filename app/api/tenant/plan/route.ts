import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ plan: 'FREE' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { plan: true }
    });

    return NextResponse.json({ plan: tenant?.plan || 'FREE' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ plan: 'FREE' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!['FREE', 'PRO'].includes(plan)) {
      return NextResponse.json({ message: 'Geçersiz plan seçimi' }, { status: 400 });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: user.tenantId },
      data: { plan },
    });

    return NextResponse.json(
      { message: 'Plan başarıyla güncellendi', plan: updatedTenant.plan },
      { status: 200 }
    );
  } catch (error) {
    console.error('Plan güncelleme hatası:', error);
    return NextResponse.json({ message: 'İşlem başarısız oldu' }, { status: 500 });
  }
}