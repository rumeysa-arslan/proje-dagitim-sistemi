import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Status, Task } from '@prisma/client';

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const totalProjects = await prisma.project.count();

    // Tüm görevleri çekip tipleri açıkça belirtiyoruz
    const allTasks = await prisma.task.findMany({
      select: { status: true },
    });

    const totalTasks = allTasks.length;
    const pendingTasks = allTasks.filter((t) => t.status === Status.TODO).length;
    const inProgressTasks = allTasks.filter((t) => t.status === Status.IN_PROGRESS).length;
    const completedTasks = allTasks.filter((t) => t.status === Status.DONE).length;

    // Projeleri ve içindeki görevleri çek
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
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