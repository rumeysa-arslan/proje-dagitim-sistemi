import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const deletedProjects = await prisma.project.findMany({
            where:{ NOT: {deletedAt:null}},
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