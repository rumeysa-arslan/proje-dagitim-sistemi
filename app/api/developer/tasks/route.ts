import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get('userId');

        if(!userId){
            return NextResponse.json(
                {message:'Kullanıcı bulunamadı.'},
                {status:400}
            );
        }

    const tasks = await prisma.task.findMany({
        where:{ assignedToId: userId},
        include:{
            project:{ select:{ title:true}},
        },
        orderBy:{createdAt:'desc'},
    });
     return NextResponse.json(tasks, {status:200});
    }catch(error){
     return NextResponse.json(
        {message:'Görevler getirilemedi.'},
        {status:500}
     );
    }
}