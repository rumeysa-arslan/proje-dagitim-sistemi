import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    //Kullanıcıyı tokenden al
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Yetkisiz erişim! Giriş yapın.' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const project = await (prisma.project as any).findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          where: { isDeleted: false },
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ message: 'Proje bulunamadı' }, { status: 404 });
    }

    const isAdmin = user.role === 'ADMIN';
    const isOwner = (project as any).createdById === user.id;
    const isAssigned = project.tasks.some((t: any) => t.assignedToId === user.id);

    if (!isAdmin && !isOwner && !isAssigned) {
      return NextResponse.json(
        { message: 'Bu projeyi görüntüleme yetkiniz yok!' },
        { status: 403 }
      );
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    console.error('Proje Getir Hatası:', error);
    return NextResponse.json({ message: 'Hata', error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.restore) {
      const restoredProject = await prisma.project.update({
        where: { id },
        data: { deletedAt: null },
      });
      return NextResponse.json(restoredProject, { status: 200 });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Proje güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (!id) {
      return NextResponse.json({ message: 'Proje ID gereklidir.' }, { status: 400 });
    }

    if (force) {
      await prisma.project.delete({ where: { id } });
      return NextResponse.json({ message: 'Proje kalıcı olarak silindi.' }, { status: 200 });
    }

    const softDeletedProject = await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { message: 'Proje çöp kutusuna taşındı.', project: softDeletedProject },
      { status: 200 }
    );
  } catch (error) {
    console.error('Proje silme hatası:', error);
    return NextResponse.json({ message: 'Proje silinirken hata oluştu.' }, { status: 500 });
  }
}