import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cropTypes = await prisma.cropType.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: cropTypes,
    });
  } catch (error) {
    console.error('Error fetching crop types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crop types' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const cropType = await prisma.cropType.create({
      data: {
        name: body.name,
        localName: body.localName,
        category: body.category,
        growingDays: body.growingDays,
        description: body.description,
      },
    });

    return NextResponse.json({
      success: true,
      data: cropType,
      message: 'Crop type created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating crop type:', error);
    return NextResponse.json(
      { error: 'Failed to create crop type' },
      { status: 500 }
    );
  }
}
