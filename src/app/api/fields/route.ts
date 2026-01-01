import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const fields = await prisma.field.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: fields,
    });
  } catch (error) {
    console.error('Error fetching fields:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fields' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const field = await prisma.field.create({
      data: {
        name: body.name,
        size: body.size,
        location: body.location,
        soilType: body.soilType,
        irrigation: body.irrigation,
        notes: body.notes,
      },
    });

    return NextResponse.json({
      success: true,
      data: field,
      message: 'Field created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating field:', error);
    return NextResponse.json(
      { error: 'Failed to create field' },
      { status: 500 }
    );
  }
}
