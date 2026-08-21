import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendApprovalEmail } from '@/lib/email';
import crypto from 'crypto';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Yetkisiz işlem! Yalnızca Admin onaylayabilir.' }, { status: 403 });
    }

    const { id: targetUserId } = await params;
    const { action } = await request.json(); // "APPROVE" veya "REJECT"

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      // 24 saat geçerli güvenli token üret
      const inviteToken = crypto.randomBytes(32).toString('hex');
      const inviteTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: {
          isApproved: true,
          approvalStatus: 'APPROVED',
          inviteToken,
          inviteTokenExpiry,
        },
      });

      // E-posta gönder
      await sendApprovalEmail(updatedUser.email, updatedUser.name, inviteToken);

      return NextResponse.json({ message: 'Kullanıcı onaylandı ve şifre belirleme maili gönderildi.' }, { status: 200 });
    } else if (action === 'REJECT') {
      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          approvalStatus: 'REJECTED',
          isActive: false,
        },
      });

      return NextResponse.json({ message: 'Başvuru reddedildi.' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Geçersiz işlem.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'İşlem başarısız.' }, { status: 500 });
  }
}