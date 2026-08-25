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
      const todoTasks = tasks.filter((t) => t.status === 'TODO');
      const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
      const completedTasks = tasks.filter((t) => t.status === 'DONE');

      const countPriorities = (taskList: typeof tasks) => ({
        high: taskList.filter((t) => String(t.priority || '').toUpperCase() === 'HIGH').length,
        medium: taskList.filter((t) => String(t.priority || '').toUpperCase() === 'MEDIUM').length,
        low: taskList.filter((t) => String(t.priority || '').toUpperCase() === 'LOW').length,
      });

      const todoPriorities = countPriorities(todoTasks);
      const inProgressPriorities = countPriorities(inProgressTasks);
      const donePriorities = countPriorities(completedTasks);

      let totalDurationMinutes = 0;
      let validTaskCount = 0;
      let onTimeCount = 0;

    completedTasks.forEach((t) => {
        const startTime = t.startedAt ? new Date(t.startedAt).getTime() : new Date(t.createdAt).getTime();
        const endTime = t.completedAt ? new Date(t.completedAt).getTime() : new Date(t.updatedAt).getTime();

        if (endTime >= startTime) {
        const diffMinutes = (endTime - startTime) / (1000 * 60);
        totalDurationMinutes += diffMinutes;
        validTaskCount++;
        }

        if (t.dueDate) {
        const finishDate = t.completedAt ? new Date(t.completedAt) : new Date(t.updatedAt);
        if (finishDate.getTime() <= new Date(t.dueDate).getTime()) {
            onTimeCount++;
        }
        } else {
        onTimeCount++;
        }
    });
    let avgCompletionDisplay = '0 Saat';
    if (validTaskCount > 0) {
        const avgMinutes = totalDurationMinutes / validTaskCount;
        if (avgMinutes < 60) {
        avgCompletionDisplay = `${Math.max(1, Math.round(avgMinutes))} Dk`;
        } else {
        const hours = (avgMinutes / 60).toFixed(1);
        avgCompletionDisplay = `${hours.endsWith('.0') ? Math.round(avgMinutes / 60) : hours} Saat`;
        }
    }

    const onTimeRate = completedTasks.length > 0
        ? Math.round((onTimeCount / completedTasks.length) * 100)
        : 100;

      return NextResponse.json({
        pms,
        developers,
        stats: {
          totalTasks,
          todoCount: todoTasks.length,
          inProgressCount: inProgressTasks.length,
          completedCount: completedTasks.length,
          avgCompletionHours: avgCompletionDisplay,
          onTimeRate,
          prioritiesByStatus: {
            todo: todoPriorities,
            inProgress: inProgressPriorities,
            done: donePriorities,
          },
        },
      });
    }

    return NextResponse.json({ pms, developers, stats: null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}