import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || !user.tenantId) {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }
    
    const totalUsers = await prisma.user.count({
      where: { 
        tenantId: user.tenantId, 
        deletedAt: null 
      }
    });
    
    const totalProjects = await prisma.project.count({
      where: { 
        tenantId: user.tenantId, 
        deletedAt: null 
      }
    });
    
    const allTasks = await prisma.task.findMany({
      where: {
        project: { tenantId: user.tenantId },
        deletedAt: null 
      },
      select: { status: true },
    });

    const totalTasks = allTasks.length;
    const pendingTasks = allTasks.filter((t) => t.status === Status.TODO).length;
    const inProgressTasks = allTasks.filter((t) => t.status === Status.IN_PROGRESS).length;
    const completedTasks = allTasks.filter((t) => t.status === Status.DONE).length;

    const projects = await prisma.project.findMany({
      where: {
        tenantId: user.tenantId,
        deletedAt: null,
      },
      include: {
        tasks: {
          where: { deletedAt: null },
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const projectStats = projects.map((p: any) => {
      const total = p.tasks.length;
      const completed = p.tasks.filter((t: any) => t.status === 'DONE').length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: p.id,
        title: p.title,
        totalTasks: total,
        completedTasks: completed,
        percent,
      };
    });

    return NextResponse.json(
      {
        overview: {
          totalUsers,
          totalProjects,
          totalTasks,
          pendingTasks,
          inProgressTasks,
          completedTasks,
        },
        projectStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Stats API Hatası:', error);
    return NextResponse.json(
      { message: 'İstatistikler alınamadı.' },
      { status: 500 }
    );
  }
}