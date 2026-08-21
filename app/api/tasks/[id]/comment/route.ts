import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request:Request,
    {params}: {params: Promise< {id: string}> | {id: string}}
)   {
    try{
        const resolvedParams = await params;
        const id= resolvedParams.id;
        const body = await request.json();
        const {comment} = body;

        if(!id){
            return NextResponse.json(
                {message:'görev id bulunamadı'},
                {status:400}
            );
        }
        const updatedTask = await prisma.task.update({
            where: {id},
            data:{description:comment},
        });
        return NextResponse.json(updatedTask, {status:200});
    }   catch(error:any){
        console.error('Comment error:', error);
        return NextResponse.json(
            {message:'Not güncellenemedi'},
            {status:500}
        );
    }
}