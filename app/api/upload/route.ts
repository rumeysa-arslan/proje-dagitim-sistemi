import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    // Dosyayı Buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Vercel diski yerine doğrudan Base64 Data URL oluştur
    const mimeType = file.type || 'application/octet-stream';
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({
      fileUrl: dataUrl,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error('Upload hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}