import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transactions = await prisma.inventoryTransaction.findMany({
      where: { itemId: params.id },
      orderBy: { transactionDate: 'desc' },
      take: 30,
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      type, 
      quantity, 
      unitCost, 
      reference,
      supplier,
      notes,
      transactionDate 
    } = body;

    // Validate required fields
    if (!type || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Type and quantity are required' },
        { status: 400 }
      );
    }

    // Check if inventory item exists
    const item = await prisma.inventoryItem.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    const qty = parseFloat(quantity);
    const cost = unitCost ? parseFloat(unitCost) : null;
    const totalCost = cost ? qty * cost : null;

    // Calculate new stock level
    let newStock = Number(item.currentStock);
    switch (type) {
      case 'PURCHASE':
      case 'RETURN':
        newStock += qty;
        break;
      case 'USAGE':
      case 'WASTE':
      case 'TRANSFER':
        newStock -= qty;
        break;
      case 'ADJUSTMENT':
        // For adjustments, quantity is the new total
        newStock = qty;
        break;
    }

    // Validate stock won't go negative (except for adjustments)
    if (type !== 'ADJUSTMENT' && newStock < 0) {
      return NextResponse.json(
        { success: false, error: 'Insufficient stock for this transaction' },
        { status: 400 }
      );
    }

    // Create transaction and update stock in a transaction
    const [transaction] = await prisma.$transaction([
      prisma.inventoryTransaction.create({
        data: {
          itemId: params.id,
          type,
          quantity: qty,
          unitCost: cost,
          totalCost,
          reference,
          supplier,
          notes,
          transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        },
      }),
      prisma.inventoryItem.update({
        where: { id: params.id },
        data: { 
          currentStock: newStock,
          unitCost: type === 'PURCHASE' && cost ? cost : item.unitCost,
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch (error) {
    console.error('Error recording transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record transaction' },
      { status: 500 }
    );
  }
}
