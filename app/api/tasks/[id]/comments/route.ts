import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Göreve ait tüm mesajları tarih sırasıyla getir
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const taskId = resolvedParams.id;

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Yeni mesaj gönder
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const taskId = resolvedParams.id;
    const { text, userId, fileUrl, fileName } = await request.json();
    const commentText = text && text.trim() !== '' ? text.trim() : (fileUrl ? '📎 Ekli dosya paylaşıldı' : '-');

    if (!userId || (!text?.trim() && !fileUrl)) {
      return NextResponse.json(
        { message: 'Mesaj metni veya dosya eklenmelidir.' },
        { status: 400 }
      );
    }

    const newComment = await prisma.comment.create({
      data: {
        text: commentText,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        taskId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error: any) {
    console.error('Prisma Yorum Kayıt Hatası:', error);
    // Hatanın tam sebebini frontend'e dönüyoruz:
    return NextResponse.json(
      { message: error?.message || 'Mesaj kaydedilirken veritabanı hatası oluştu.' },
      { status: 500 }
    );
  }
}