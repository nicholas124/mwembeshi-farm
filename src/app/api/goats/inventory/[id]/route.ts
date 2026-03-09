import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// GET /api/goats/inventory/[id] - Get single inventory item with transactions
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

// PUT /api/goats/inventory/[id] - Update inventory item
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        currentStock: body.currentStock,
        unit: body.unit,
        minStock: body.minStock ?? null,
        maxStock: body.maxStock ?? null,
        unitCost: body.unitCost ?? null,
        location: body.location,
        supplier: body.supplier ?? null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        notes: body.notes ?? null,
      },
    });

    await createNotification({
      type: 'GOAT_INVENTORY',
      title: 'Goat Inventory Updated',
      message: `Goat inventory item "${item.name}" was updated`,
      entityType: 'goat_inventory',
      entityId: item.id,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

// DELETE /api/goats/inventory/[id] - Soft delete
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.inventoryItem.update({
      where: { id },
      data: { isActive: false },
    });

    await createNotification({
      type: 'GOAT_INVENTORY',
      title: 'Goat Inventory Deactivated',
      message: `A goat inventory item was deactivated`,
      entityType: 'goat_inventory',
      entityId: id,
    });

    return NextResponse.json({ message: 'Item deactivated' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
