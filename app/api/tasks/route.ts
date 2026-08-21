import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request : Request) {
    try {
        const body =await request.json();
        const { title, description, priority, projectId, assignedToId, dueDate } = body;

        if (assignedToId) {
            const assignedUser = await prisma.user.findUnique({
                where: { id: assignedToId },
            });

            if (assignedUser && assignedUser.isActive === false) {
                return NextResponse.json(
                { message: 'Pasif durumda olan bir geliştiriciye görev atanamaz!' },
                { status: 400 }
                );
            }
            }

        const newTask = await prisma.task.create({
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

        return NextResponse.json(newTask, {status:201});
    }   catch (error){
        return NextResponse.json(
            {messagee:'görev oluşturulurken hata oluştu.'},
            {status:500}
        );
    }
}