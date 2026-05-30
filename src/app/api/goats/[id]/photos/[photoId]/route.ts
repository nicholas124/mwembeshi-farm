import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';

// DELETE /api/goats/[id]/photos/[photoId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const { photoId } = await params;

    const photo = await prisma.goatPhoto.findUnique({ where: { id: photoId } });
    if (!photo) {
      return NextResponse.json({ success: false, error: 'Photo not found' }, { status: 404 });
    }

    // Remove from storage — extract path after bucket name
    const url = new URL(photo.photoUrl);
    const pathParts = url.pathname.split('/goat-photos/');
    if (pathParts[1]) {
      await supabaseAdmin.storage.from('goat-photos').remove([pathParts[1]]);
    }

    await prisma.goatPhoto.delete({ where: { id: photoId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Photo delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete photo' }, { status: 500 });
  }
}
