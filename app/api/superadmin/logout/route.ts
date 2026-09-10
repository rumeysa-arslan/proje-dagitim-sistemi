import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Başarıyla çıkış yapıldı' });
    response.cookies.delete('superadmin_token');
    response.cookies.delete('auth_token');

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Çıkış yapılırken bir hata oluştu' }, { status: 500 });
  }
}
