import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || !user.tenantId) {
            return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
        }

        const deletedProjects = await prisma.project.findMany({
            where:{
                tenantId: user.tenantId,
                NOT: {deletedAt:null}},
            orderBy:{deletedAt:'desc'},
        });
        const formatted = deletedProjects.map((p) => ({
            id:p.id,
            title:p.title,
            description: p.description,
        }));
        return NextResponse.json(formatted);
    }   catch(error:any){
        return NextResponse.json({message: 'Projeler alınamadı.'} ,{status:500});
    }
}