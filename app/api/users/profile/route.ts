import { NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.tenantId){
      return NextResponse.json({message: 'Yetkisiz Erişim'}, {status:401});
    }
    const db = getTenantPrisma(currentUser.tenantId);
    const {searchParams} = new URL(request.url);
    const userId = searchParams.get('userId');
    

    if (!userId) {
      return NextResponse.json({ message: 'Kullanıcı ID gereklidir.' }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, skills: true },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Kullanıcı çekilemedi.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.tenantId) {
      return NextResponse.json({ message: 'Yetkisiz erişim! Giriş yapın.' }, { status: 401 });
    }

    const db = getTenantPrisma(currentUser.tenantId);
    const { userId, skills } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: 'Kullanıcı ID zorunludur.' }, { status: 400 });
    }
    const targetUser = await db.user.findFirst({ where: { id: userId } });
    if(!targetUser){
      return NextResponse.json(
        {message: 'Bu kullanıcı bulunamadı veya şirketinize ait değil.'},
        {status:404}
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { skills },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Güncelleme başarısız oldu.' }, { status: 500 });
  }
}