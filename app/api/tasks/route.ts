import { NextResponse } from "next/server";
import { getTenantPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ message: 'Yetkisiz erişim! Giriş yapın.' }, { status: 401 });
    }
    const db = getTenantPrisma(user.tenantId);

    const body = await request.json();
    const { title, description, priority, projectId, assignedToId, dueDate } = body;

    if (assignedToId) {
      const assignedUser = await db.user.findFirst({
        where: { id: assignedToId },
      });

      if (assignedUser && assignedUser.isActive === false) {
        return NextResponse.json(
          { message: 'Pasif durumda olan bir geliştiriciye görev atanamaz!' },
          { status: 400 }
        );
      }
    }
    const newTask = await db.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        projectId,
        assignedToId: assignedToId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        isDeleted: false,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Görev oluşturma hatası:", error);
    return NextResponse.json(
      { message: 'Görev oluşturulurken hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
const user = await getCurrentUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ message: 'Yetkisiz erişim! Giriş yapın.' }, { status: 401 });
    }

    const db = getTenantPrisma(user.tenantId);

    const tasks = await db.task.findMany({
      where: { assignedToId: user.id },
      include: {
        project: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Görevler getirilemedi.' }, { status: 500 });
  }
}