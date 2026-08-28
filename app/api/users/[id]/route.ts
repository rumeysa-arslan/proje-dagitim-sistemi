import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
/*
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Next.js'in yeni sürümünde params Promise olduğu için await ediyoruz
    const resolvedParams = await params;
    const {id} = resolvedParams;

    const currentUser = await prisma.user.findUnique({
      where: {id},
    });
    if (!currentUser) {
      return NextResponse.json({message:'Kulllanıcı bulunamadı.'} , {status:404});
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {deletedAt:new.date(), isActive:false},
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Kullanıcı durumu güncellenirken hata:', error);
    return NextResponse.json(
      { message: 'Durum güncellenemedi', error: error.message },
      { status: 500 }
    );
  }
}
*/

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date()  },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Kullanıcı silinemedi:', error);
    return NextResponse.json(
      { message: 'Kullanıcı silinirken hata oluştu', error: error.message },
      { status: 500 }
    );
  }
}