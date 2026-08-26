import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        skills: true,
        isActive: true,
        isApproved: true,       
        approvalStatus: true,
        createdAt: true,
        projects: {         
        select: {
          id: true,
          title: true,
        },
      },
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try{
        const body = await request.json();
        const {name, email, password, role} = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                {message:'Tüm alanların doldurulması zorunludur.'},
                {status:400}
            );
        }
        //e posta zaten var mı
        const existingUser = await prisma.user.findUnique({
            where:{email},
        });

        if(existingUser){
            return NextResponse.json(
                {message:'Bu e posta ile kaydolmuş kullanıcı zaten var!'},
                {status:400}
            );
        }
        //şifre hash
        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await prisma.user.create({
            data:{
                name,
                email,
                password:hashedPassword,
                role,
            },
            select: {
                id:true,
                name:true,
                email:true,
                role:true,
            },
        });
        return NextResponse.json(newUser, {status:201});
    }   catch (error) {
        return NextResponse.json(
            {message:'Kullanıcı oluşturulurken bir hata oluştu.'},
            {status:500}
        );
    }
}