import { NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/prisma';
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
    const db = getTenantPrisma(user.tenantId);
    const project = await db.project.findFirst({
      where: { id: projectId },
      include: {
        tasks: {
          where: {  deletedAt : null },
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
    const isAnalyst = user.role === 'ANALYST';
    const isOwner = (project).createdById === user.id;
    const isAssigned = project.tasks.some((t) => t.assignedToId === user.id);

    if (!isAdmin && !isOwner && !isAssigned && !isAnalyst) {
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
    const user = await getCurrentUser();
    if (!user || !user.tenantId){
      return NextResponse.json({message: 'Yetkisiz erişm'} , { status:401 });
    }
    const { id } = await params;
    const body = await request.json();
    const db = getTenantPrisma(user.tenantId);

    const existing = await db.project.findFirst({where:{id}});
    if (!existing){
      return NextResponse.json({ message: 'Proje bulunamadı veya yetkisiz işlem'} , {status:404});
    }

    if (body.restore) {
      const restoredProject = await (db.project as any).update({
        where: { id },
        data: { deletedAt: null },
      });
      return NextResponse.json(restoredProject, { status: 200 });
    }

    const updatedProject = await (db.project).update({
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
    const user = await getCurrentUser();

    if(!user || !user.tenantId) {
      return NextResponse.json({message: 'Yetkisizi erişim '}, {status:401});
    }
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (!id) {
      return NextResponse.json({ message: 'Proje ID gereklidir.' }, { status: 400 });
    }

    const db = getTenantPrisma(user.tenantId);

    const existing = await db.project.findFirst({ where: {id}});
    if(!existing){
      return NextResponse.json({message: ' Proje bulunamadı veya yetkisiz işlem.'} , {status: 404});
    }

    if (force) {
      await (db.project as any).delete({ where: { id } });
      return NextResponse.json({ message: 'Proje kalıcı olarak silindi.' }, { status: 200 });
    }

    const softDeletedProject = await (db.project as any).update({
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