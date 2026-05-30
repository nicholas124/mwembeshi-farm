import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/goats/[id]/photos — list all photos for a goat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photos = await prisma.goatPhoto.findMany({
      where: { animalId: id },
      orderBy: { takenAt: 'desc' },
    });
    return NextResponse.json({ success: true, photos });
  } catch (error) {
    console.error('Error fetching goat photos:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch photos' }, { status: 500 });
  }
}

// POST /api/goats/[id]/photos — upload a new growth photo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { base64, mimeType = 'image/jpeg', caption, takenAt } = body;

    if (!base64) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    const buffer = Buffer.from(base64, 'base64');
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';
    const filename = `${id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('goat-photos')
      .upload(filename, buffer, { contentType: mimeType, upsert: false });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('goat-photos')
      .getPublicUrl(filename);

    const photo = await prisma.goatPhoto.create({
      data: {
        animalId: id,
        photoUrl: urlData.publicUrl,
        caption: caption || null,
        takenAt: takenAt ? new Date(takenAt) : new Date(),
      },
    });

    return NextResponse.json({ success: true, photo }, { status: 201 });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload photo' }, { status: 500 });
  }
}
