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
    const { name, slug, plan } = body;

    if (!name || !slug) {
      return NextResponse.json({ message: 'Şirket adı ve slug zorunludur' }, { status: 400 });
    }

    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return NextResponse.json({ message: 'Bu adres zaten başka bir şirket tarafından kullanılıyor' }, { status: 400 });
    }

    const newTenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        plan: plan || 'FREE', 
      },
    });

    return NextResponse.json({ message: 'Şirket başarıyla oluşturuldu', tenant: newTenant }, { status: 201 });

  } catch (error: any) {
    console.error('Yeni Şirket Ekleme Hatası:', error);
    return NextResponse.json({ message: 'Sunucu hatası oluştu' }, { status: 500 });
  }
}