import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
          take: 50,
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name: body.name,
        sku: body.sku || null,
        category: body.category,
        currentStock: body.currentStock ? parseFloat(body.currentStock) : 0,
        unit: body.unit,
        minStock: body.minStock ? parseFloat(body.minStock) : null,
        maxStock: body.maxStock ? parseFloat(body.maxStock) : null,
        unitCost: body.unitCost ? parseFloat(body.unitCost) : null,
        location: body.location || null,
        supplier: body.supplier || null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        notes: body.notes || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Soft delete by setting isActive to false
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Inventory item deactivated successfully',
      data: item 
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
