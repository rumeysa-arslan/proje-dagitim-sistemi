import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: {
        tenantId: user.tenantId,
        deletedAt: null,
        role:'DEVELOPER'
      },
      include: {
        skills:{
          where:{ isDeleted:false }
        },
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