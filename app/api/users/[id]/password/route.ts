import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id: targetUserId } = await params;
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json(
        { message: 'Yeni şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    const isAdmin = currentUser.role === 'ADMIN';
    const isSelf = currentUser.id === targetUserId;

    //Sadece Admin veya kullanıcının kendisi değiştirebilir
    if (!isAdmin && !isSelf) {
      return NextResponse.json({ message: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    //kullanıcıyı bul
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // değiştiren admin değilse şifresini doğrulaması
    if (isSelf && !isAdmin) {
      if (!currentPassword) {
        return NextResponse.json({ message: 'Mevcut şifrenizi girmelisiniz' }, { status: 400 });
      }

      const dbPass = (targetUser as any).password || (targetUser as any).passwordHash || '';
      let isOldValid = false;

      if (dbPass.startsWith('$2a$') || dbPass.startsWith('$2b$')) {
        isOldValid = await bcrypt.compare(currentPassword, dbPass);
      } else {
        isOldValid = dbPass === currentPassword;
      }

      if (!isOldValid) {
        return NextResponse.json({ message: 'Mevcut şifreniz hatalı' }, { status: 400 });
      }
    }
    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: 'Şifre başarıyla güncellendi' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Şifre Güncelleme Hatası:', error);
    return NextResponse.json({ message: 'Sunucu hatası: ' + error?.message }, { status: 500 });
  }
}