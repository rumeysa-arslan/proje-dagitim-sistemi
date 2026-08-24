import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'PM';
    const selectedId = searchParams.get('id');

    const pms = await prisma.user.findMany({
      where: { role: 'PM', deletedAt: null, isActive: true },
      select: { id: true, name: true, email: true },
    });

    const developers = await prisma.user.findMany({
      where: { role: 'DEVELOPER', deletedAt: null, isActive: true },
      select: { id: true, name: true, email: true },
    });

    if (type === 'PM') {
      const pmId = selectedId || (pms.length > 0 ? pms[0].id : null);

      if (!pmId) {
        return NextResponse.json({ pms, developers, stats: null });
      }

      const projects = await prisma.project.findMany({
        where: { createdById: pmId, deletedAt: null },
        include: {
          tasks: {
            where: { isDeleted: false },
            include: { assignedTo: { select: { id: true, name: true } } },
          },
        },
      });

      const totalProjects = projects.length;
      let totalTasks = 0;
      let completedTasks = 0;

      const devStatsMap: Record<string, {
        name: string;
        assignedCount: number;
        completedCount: number;
        lastAssignedDate: string | null;
        lastCompletedDate: string | null;
      }> = {};

      projects.forEach((proj) => {
        proj.tasks.forEach((task) => {
          totalTasks++;
          if (task.status === 'DONE') completedTasks++;

          if (task.assignedTo) {
            const devId = task.assignedTo.id;
            const devName = task.assignedTo.name || 'İsimsiz';

            if (!devStatsMap[devId]) {
              devStatsMap[devId] = {
                name: devName,
                assignedCount: 0,
                completedCount: 0,
                lastAssignedDate: null,
                lastCompletedDate: null,
              };
            }

            devStatsMap[devId].assignedCount++;
            if (task.createdAt) {
              devStatsMap[devId].lastAssignedDate = new Date(task.createdAt).toLocaleDateString('tr-TR');
            }

            if (task.status === 'DONE') {
              devStatsMap[devId].completedCount++;
              const doneDate = task.completedAt || task.updatedAt || new Date();
              devStatsMap[devId].lastCompletedDate = new Date(doneDate).toLocaleDateString('tr-TR');
            }
          }
        });
      });

      const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const projectProgressList = projects.map((p) => {
        const pTotal = p.tasks.length;
        const pDone = p.tasks.filter((t) => t.status === 'DONE').length;
        const percentage = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
        return {
          id: p.id,
          title: p.title,
          totalTasks: pTotal,
          doneTasks: pDone,
          percentage: percentage,
        };
      });

      return NextResponse.json({
        pms,
        developers,
        stats: {
          totalProjects,
          totalTasks,
          completedTasks,
          overallCompletionRate,
          projectProgressList,
          distributionChart: Object.values(devStatsMap),
        },
      });
    }

    if (type === 'DEVELOPER') {
      const devId = selectedId || (developers.length > 0 ? developers[0].id : null);
      if (!devId) return NextResponse.json({ pms, developers, stats: null });

      const tasks = await prisma.task.findMany({
        where: { assignedToId: devId, isDeleted: false },
      });

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === 'DONE');

      let totalDurationHours = 0;
      let durationCount = 0;
      let onTimeCount = 0;

      completedTasks.forEach((t) => {
        if (t.startedAt && t.completedAt) {
          const diffMs = new Date(t.completedAt).getTime() - new Date(t.startedAt).getTime();
          totalDurationHours += diffMs / (1000 * 60 * 60);
          durationCount++;
        }
        if (t.dueDate && t.completedAt && new Date(t.completedAt) <= new Date(t.dueDate)) {
          onTimeCount++;
        }
      });

      const avgCompletionHours = durationCount > 0 ? Math.round(totalDurationHours / durationCount) : 0;
      const onTimeRate = completedTasks.length > 0 ? Math.round((onTimeCount / completedTasks.length) * 100) : 100;

      const priorityDistribution = [
        { label: 'Yüksek (HIGH)', count: tasks.filter((t) => t.priority === 'HIGH').length, color: '#1E40AF' },
        { label: 'Orta (MEDIUM)', count: tasks.filter((t) => t.priority === 'MEDIUM').length, color: '#3B82F6' },
        { label: 'Düşük (LOW)', count: tasks.filter((t) => t.priority === 'LOW').length, color: '#93C5FD' },
      ];

      return NextResponse.json({
        pms,
        developers,
        stats: {
          totalTasks,
          completedCount: completedTasks.length,
          avgCompletionHours,
          onTimeRate,
          priorityDistribution,
        },
      });
    }

    return NextResponse.json({ pms, developers, stats: null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}