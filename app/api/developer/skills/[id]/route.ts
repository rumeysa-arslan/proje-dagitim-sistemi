import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (!id) {
      return NextResponse.json({ message: 'Yetenek ID gereklidir.' }, { status: 400 });
    }

    if (force) {
      await prisma.skill.delete({ where: { id } });
      return NextResponse.json({ message: 'Yetenek silindi.' }, { status: 200 });
    }


  } catch (error) {
    return NextResponse.json({ message: 'Yetenek silinirken bir hata oluştu.' },
    { status: 500 });
  }
}