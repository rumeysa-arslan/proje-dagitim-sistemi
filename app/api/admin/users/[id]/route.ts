import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        projects: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Admin user detail error:", error);
    return NextResponse.json(
      { message: 'Kullanıcı detayları alınamadı.' },
      { status: 500 }
    );
  }
}