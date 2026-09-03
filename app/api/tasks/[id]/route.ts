import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Yetkisiz erişim! Giriş yapın.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();


    const task = await (prisma.task as any).findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      return NextResponse.json({ message: 'Görev bulunamadı' }, { status: 404 });
    }

    const isAdmin = user.role === 'ADMIN';
    const isProjectOwner = task.project?.createdById === user.id;
    const isAssignedDeveloper = task.assignedToId === user.id;

    if (!isAdmin && !isProjectOwner && !isAssignedDeveloper) {
      return NextResponse.json(
        { message: 'Bu görevi düzenleme yetkiniz yok!' },
        { status: 403 }
      );
    }
    if (body.restore) {
      const restoredTask = await (prisma.task as any).update({
        where: { id },
        data: { deletedAt: null, isDeleted: false },
      });
      return NextResponse.json(restoredTask, { status: 200 });
    }
    
    const updateData: any = {
      status: body.status || task.status,
    };
    if (updateData.status === 'IN_PROGRESS') {
      updateData.startedAt = new Date();
    } else if (updateData.status === 'DONE') {
      updateData.completedAt = new Date();
    } else if (updateData.status === 'TODO') {
      updateData.startedAt = null;
      updateData.completedAt = null;
    }

    console.log("Prisma'ya Gönderilecek Data:", updateData);
    const updatedTask = await (prisma.task as any).update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json(updatedTask, { status: 200 }); 
  } catch (error: any) {
    console.error('Görev Güncelleme Hatası:', error);
    return NextResponse.json({ message: 'Güncelleme başarısız: ' + error?.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;

    const task = await (prisma.task as any).findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      return NextResponse.json({ message: 'Görev bulunamadı' }, { status: 404 });
    }

    const isAdmin = user.role === 'ADMIN';
    const isProjectOwner = task.project?.createdById === user.id;

    if (!isAdmin && !isProjectOwner) {
      return NextResponse.json(
        { message: 'Görevi silme yetkiniz yok! Yalnızca PM veya Admin silebilir.' },
        { status: 403 }
      );
    }

    await (prisma.task as any).update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Görev başarıyla silindi' }, { status: 200 });
  } catch (error: any) {
    console.error('Görev Silme Hatası:', error);
    return NextResponse.json({ message: 'Silme işlemi başarısız: ' + error?.message }, { status: 500 });
  }
}