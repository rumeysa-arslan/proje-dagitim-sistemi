import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(tenants, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Şirketler yüklenemedi' }, { status: 500 });
  }
}