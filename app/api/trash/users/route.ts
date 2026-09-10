import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const deletedUser= await prisma.user.findMany({
        where: {NOT: {deletedAt: null,},},
        orderBy:{deletedAt:'desc'}
    });
    const formattedUser = deletedUser.map((u) => ({
        id:u.id,
        title:`${u.name} (${u.email})`,
        type: 'USER',
        role: u.role,
    }));
    return NextResponse.json(formattedUser);
  } catch (error: any) {
    console.error('Çöp kutusu verisi alınamadı:', error);
    return NextResponse.json({ message: 'Hata oluştu' }, { status: 500 });
  }
}