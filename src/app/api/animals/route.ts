import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AnimalType, AnimalStatus, Gender } from '@/types';

// GET /api/animals - List all animals with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const type = searchParams.get('type') as AnimalType | null;
    const status = searchParams.get('status') as AnimalStatus | null;
    const gender = searchParams.get('gender') as Gender | null;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (type) where.type = type;
    if (status) where.status = status;
    if (gender) where.gender = gender;
    if (search) {
      where.OR = [
        { tag: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { breed: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get total count
    const total = await prisma.animal.count({ where });
    
    // Get animals with pagination
    const animals = await prisma.animal.findMany({
      where,
      include: {
        mother: { select: { id: true, tag: true, name: true } },
        father: { select: { id: true, tag: true, name: true } },
        treatments: {
          orderBy: { treatmentDate: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            offspringAsMother: true,
            offspringAsFather: true,
            treatments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    return NextResponse.json({
      success: true,
      data: animals,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching animals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch animals' },
      { status: 500 }
    );
  }
}

// POST /api/animals - Create a new animal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const animal = await prisma.animal.create({
      data: {
        tag: body.tag,
        name: body.name,
        type: body.type,
        breed: body.breed,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        acquisitionMethod: body.acquisitionMethod || 'BORN',
        purchasePrice: body.purchasePrice || null,
        motherId: body.motherId || null,
        fatherId: body.fatherId || null,
        color: body.color || null,
        weight: body.weight || null,
        notes: body.notes || null,
        status: 'ACTIVE',
        recordedById: body.recordedById || null,
      },
      include: {
        mother: { select: { id: true, tag: true, name: true } },
        father: { select: { id: true, tag: true, name: true } },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: animal,
      message: 'Animal created successfully',
    });
  } catch (error) {
    console.error('Error creating animal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create animal' },
      { status: 500 }
    );
  }
}
