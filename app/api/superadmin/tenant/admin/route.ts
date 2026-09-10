import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

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
    const { name , email, password , tenantId } = body;

    if (!name || !email || !password || !tenantId) {
      return NextResponse.json({ message: 'Tüm alanlar zorunludur.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Bu e-posta adresi zaten kullanılıyor.' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
        data: {
            name,
            email,
            password:hashedPassword,
            role: 'ADMIN',
            tenantId: tenantId,
        },
    });

    return NextResponse.json({ message: 'Şirket yöneticisi başarıyla atandı' }, { status: 201 });

  } catch (error: any) {
    console.error('Admin atama hatası:', error);
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
  }
}