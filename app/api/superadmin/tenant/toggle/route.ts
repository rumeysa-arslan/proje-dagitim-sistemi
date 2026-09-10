import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'super_gizli_ve_guclu_bir_anahtar_123456';
const encodedKey = new TextEncoder().encode(secretKey);

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('superadmin_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, encodedKey);
    if (!payload || !(payload as any).isSuperAdmin) {
      return NextResponse.json({ message: 'Sadece SuperAdmin bu işlemi yapabilir' }, { status: 403 });
    }

    const body = await request.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json({ message: 'Şirket ID eksik' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Şirket bulunamadı' }, { status: 404 });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        isActive: !tenant.isActive, 
      },
    });

    return NextResponse.json({
      message: 'Şirket durumu güncellendi',
      isActive: updatedTenant.isActive,
    });

  } catch (error: any) {
    console.error('Tenant Toggle Hatası:', error);
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
  }
}