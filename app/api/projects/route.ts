import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Yetkisiz erişim! Lütfen giriş yapın.' }, { status: 401 });
    }

    const whereCondition: any = {
      tenantId: user.tenantId,
      deletedAt: null,
    };

    if (user.role !== 'ADMIN') {
      whereCondition.OR = [
        { createdById: user.id },
        { tasks: { some: { assignedToId: user.id, deletedAt: null } } },
      ];
    }

    const projects = await prisma.project.findMany({
      where: whereCondition,
      include: {
        tasks: {
          where: { 
            deletedAt : null },
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
export async function POST(request: Request) {
  try {

    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.tenantId) {
      return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
    }
    const tenant = await prisma.tenant.findUnique({
            where: { id: currentUser.tenantId },
        });
        
        const plan = tenant?.plan || 'FREE';
        const projectLimit = plan === 'PRO' ? 50 : 3;

        const currentProjectCount = await prisma.project.count({
          where: {
            createdById: currentUser.id,
            deletedAt: null,
          }
        });

        if (currentProjectCount >= projectLimit) {
            return NextResponse.json(
                { message: 'Yöneticinizle iletişime geçiniz. Planınız FREE, PRO plana yükseltin.' },
                { status: 403 }
            );
        }

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
        tenantId: currentUser.tenantId,
        createdById: currentUser.id,
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