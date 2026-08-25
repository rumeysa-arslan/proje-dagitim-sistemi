import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        projects: true,

        tasks:{
          where:{
            isDeleted:false,
          },
          select:{
            id:true,
            status:true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ message: 'Kullanıcılar alınamadı', error: error.message }, { status: 500 });
  }
}