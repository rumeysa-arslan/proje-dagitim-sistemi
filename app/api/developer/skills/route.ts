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

    const skills = await prisma.skill.findMany({
        where:{ userId: userId},
    });
     return NextResponse.json(skills, {status:200});
    }catch(error){
     return NextResponse.json(
        {message:'Yetenekler Bulunamadı.'},
        {status:500}
     );
    }
}


export async function POST(request: Request) {
  try {
      const body = await request.json();
      const { userId, newskill }  : { userId : string, newskill : string} = body;

    if (!userId) {
      return NextResponse.json({ message: 'Kullanıcı ID gereklidir.' }, { status: 400 });
    }

    const existingskill = await prisma.skill.findMany({
      where : { userId : userId }
    });

    if(existingskill.some(skill => skill.text === newskill)){
      return NextResponse.json(
        {message:'Bu yetenek zaten ekli.'}, { status : 400 }
      );
    }

    const addedSkill = await prisma.skill.create({
        data: {
            text : newskill,
            level : "MEDIUM",
            userId : userId,
            isDeleted: false,
        },
    });

    return NextResponse.json(addedSkill, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Yetenek kaydedilirken veritabanı hatası oluştu.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, skills } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: 'Kullanıcı ID gereklidir.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { skills },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Yetenekler güncellenemedi.' }, 
    { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
      const body = await request.json();
      const { userId, deletedskill }  : { userId : string, deletedskill : string} = body;

    if (!userId) {
      return NextResponse.json({ message: 'Yetenek Kullanıcı ID gereklidir.' }, { status: 400 });
    }

    if (deletedskill) {
      await prisma.skill.deleteMany({ where: { userId : userId, text : deletedskill } });
      return NextResponse.json({ message: 'Yetenek silindi.' }, { status: 200 });
    }


  } catch (error) {
    return NextResponse.json({ message: 'Yetenek silinirken bir hata oluştu.' },
    { status: 500 });
  }
}
