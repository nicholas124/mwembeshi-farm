import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/goats/inventory/[id]/transactions - Record a stock transaction
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Verify item exists
    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const quantity = parseFloat(body.quantity);
    const currentStock = parseFloat(item.currentStock.toString());

    // Calculate new stock based on transaction type
    let newStock = currentStock;
    if (body.type === 'PURCHASE' || body.type === 'RETURN') {
      newStock = currentStock + quantity;
    } else if (body.type === 'USAGE' || body.type === 'WASTE') {
      newStock = currentStock - quantity;
      if (newStock < 0) newStock = 0;
    } else if (body.type === 'ADJUSTMENT') {
      newStock = quantity; // Direct set
    } else if (body.type === 'TRANSFER') {
      newStock = currentStock - quantity;
      if (newStock < 0) newStock = 0;
    }

    // Create transaction and update stock atomically
    const [transaction] = await prisma.$transaction([
      prisma.inventoryTransaction.create({
        data: {
          itemId: id,
          type: body.type,
          quantity: body.quantity,
          unitCost: body.unitCost || null,
          totalCost: body.totalCost || null,
          reference: body.reference || null,
          supplier: body.supplier || null,
          notes: body.notes || null,
          transactionDate: body.transactionDate ? new Date(body.transactionDate) : new Date(),
        },
      }),
      prisma.inventoryItem.update({
        where: { id },
        data: { currentStock: newStock },
      }),
    ]);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error recording transaction:', error);
    return NextResponse.json(
      { error: 'Failed to record transaction' },
      { status: 500 }
    );
  }
}
