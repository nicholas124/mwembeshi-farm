import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/goats/[id]/photo — upload a goat photo (base64)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { base64, mimeType = 'image/jpeg' } = body;

    if (!base64) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    // Decode base64 to buffer
    const buffer = Buffer.from(base64, 'base64');
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';
    const filename = `${id}-${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('goat-photos')
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('goat-photos')
      .getPublicUrl(filename);

    const photoUrl = urlData.publicUrl;

    // Delete old photo if it exists
    const existing = await prisma.animal.findUnique({ where: { id }, select: { photo: true } });
    if (existing?.photo) {
      const oldFilename = existing.photo.split('/').pop();
      if (oldFilename) {
        await supabaseAdmin.storage.from('goat-photos').remove([oldFilename]);
      }
    }

    // Save URL to the animal record
    await prisma.animal.update({
      where: { id },
      data: { photo: photoUrl },
    });

    return NextResponse.json({ success: true, photoUrl });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload photo' }, { status: 500 });
  }
}

// DELETE /api/goats/[id]/photo — remove a goat photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const animal = await prisma.animal.findUnique({ where: { id }, select: { photo: true } });
    if (animal?.photo) {
      const filename = animal.photo.split('/').pop();
      if (filename) {
        await supabaseAdmin.storage.from('goat-photos').remove([filename]);
      }
    }

    await prisma.animal.update({ where: { id }, data: { photo: null } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Photo delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete photo' }, { status: 500 });
  }
}
