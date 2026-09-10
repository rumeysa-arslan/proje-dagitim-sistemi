import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const deletedTasks = await prisma.task.findMany({
      where: {
        NOT: { deletedAt: null },
        ...(projectId ? { projectId } : {}),
      },
      include: {
        project: {
          select: { title: true },
        },
        assignedTo: {
          select: { name: true, email: true },
        },
      },
      orderBy: { deletedAt: 'desc' },
    });

    const formattedTasks = deletedTasks.map((t) => ({
      id: t.id,
      title: t.title,
      type: 'TASK',
      project: t.project,
      assignedTo: t.assignedTo,
      deletedAt: t.deletedAt,
    }));

    return NextResponse.json(formattedTasks);
  } catch (error: any) {
    console.error('Görev çöp kutusu verisi alınamadı:', error);
    return NextResponse.json({ message: 'Hata oluştu', error: error.message }, { status: 500 });
  }
}