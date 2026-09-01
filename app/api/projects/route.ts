import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim! Lütfen giriş yapın.' }, { status: 401 });
    }

    const whereCondition: any = {};

    if (user.role !== 'ADMIN') {
      whereCondition.OR = [
        { createdById: user.id },
        { tasks: { some: { assignedToId: user.id,  deletedAt : null  } } },
      ];
    }

    const projects = await (prisma.project as any).findMany({
      where: whereCondition,
      include: {
        tasks: {
          where: { deletedAt : null },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(projects, { status: 200 });
  } catch (error: any) {
    console.error('Projeler GET Hatası:', error);
    return NextResponse.json(
      { error: error?.message || 'Projeler yüklenemedi' },
      { status: 500 }
    );
  }
}
// 2. Yeni Proje Ekle (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, createdById, userId } = body;
    const authorId = createdById || userId;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { message: 'Proje başlığı girilmesi zorunludur.' },
        { status: 400 }
      );
    }

    if (!authorId) {
      return NextResponse.json(
        { message: 'Projeyi oluşturan kullanıcı bilgisi eksik.' },
        { status: 400 }
      );
    }

    const newProject = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        createdBy: {
          connect: { id: authorId },
        },
      },
    }); 

    return NextResponse.json(newProject, { status: 201 });
  } catch (error: any) {
    console.error('Proje POST Hatası:', error);
    return NextResponse.json(
      { message: 'Proje oluşturulurken hata oluştu', error: error?.message },
      { status: 500 }
    );
  }
}