import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { title } from 'process';

export async function GET(request:Request) {
  try {
    const {searchParams}= new URL(request.url);
    const projectId = searchParams.get('projectId');

    const deletedTasks = await prisma.task.findMany({
      where: {
        NOT:{ deletedAt: null},
        ...(projectId? {projectId} : {}),
      },
      include:{
        project: {select:{title:true}},
        assignedTo:{select:{name:true}},
      },
      orderBy: {deletedAt: 'desc'},
    });
    const formatted = deletedTasks.map((t) => ({
      id:t.id,
      title:t.title,
      type:'TASK',
      projectTitle:t.project?.title,
      assignedToName: t.assignedTo?.name
    }));
    return NextResponse.json (formatted);
  } catch (error: any) {
    return NextResponse.json({ message: 'Hata oluştu' }, { status: 500 });
  }
}