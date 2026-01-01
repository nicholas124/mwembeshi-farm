import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const item = await prisma.inventoryItem.create({
      data: {
        name: body.name,
        sku: body.sku,
        category: body.category,
        currentStock: body.currentStock,
        unit: body.unit,
        minStock: body.minStock,
        maxStock: body.maxStock,
        unitCost: body.unitCost,
        location: body.location,
        supplier: body.supplier,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        notes: body.notes,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}
