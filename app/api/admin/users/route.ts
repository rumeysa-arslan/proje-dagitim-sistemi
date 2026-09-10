import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: {
        tenantId: user.tenantId,        
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
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: currentUser.tenantId },
        });

        const body = await request.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { message: 'Tüm alanların doldurulması zorunludur.' },
                { status: 400 }
            );
        }

        const limitRes = await checkRoleLimit(role, tenant);

        if (limitRes.excessLimit) {
            return NextResponse.json(
                { message: `Plan sınırına ulaştınız (${limitRes.limit} personel). Yeni kullanıcı eklemek için planınızı yükseltmelisiniz.` },
                { status: 403 }
            );
        }

        const existingUser = await prisma.user.findFirst({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Bu e posta ile kaydolmuş kullanıcı zaten var!' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                tenantId: currentUser.tenantId,
                isActive: true,
                isApproved: true,
                approvalStatus: "APPROVED",
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Kullanıcı oluşturulurken bir hata oluştu.' },
            { status: 500 }
        );
    }
}

async function checkRoleLimit(role: Role, tenant: any): Promise<{ excessLimit: boolean; limit: number }> {
    let planLimit = 50;
    const plan = tenant?.plan || 'FREE';
    if(plan === 'ENTERPRISE')
        return { excessLimit : false , limit : 9999999};

    if (role === "DEVELOPER") {
        planLimit = plan === 'PRO' ? 50 : 5;
    } else if (role === "PM") {
        planLimit = plan === 'PRO' ? 15 : 2;
    } else if (role === "ADMIN") {
        planLimit = plan === 'PRO' ? 10 : 1;
    } else if (role === "ANALYST") {
        planLimit = plan === 'PRO' ? 10 : 1;
    }
    
    const currentUserCount = await prisma.user.count({
        where: {
            tenantId: tenant.id,
            deletedAt: null,
            role: role,
            isApproved: true,
            approvalStatus: "APPROVED"
        }
    });

    const excessLimit = currentUserCount >= planLimit;

    if (excessLimit) {
        return { excessLimit, limit: planLimit };
    }

    return { excessLimit: false, limit: planLimit };
}