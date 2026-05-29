import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/goats/feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const penId = searchParams.get('penId');
    const animalId = searchParams.get('animalId');
    const date = searchParams.get('date');
    const days = parseInt(searchParams.get('days') || '7');

    const since = date
      ? new Date(date)
      : new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const records = await prisma.feedRecord.findMany({
      where: {
        ...(penId && { penId }),
        ...(animalId && { animalId }),
        date: { gte: since },
      },
      include: {
        pen: { select: { id: true, name: true, type: true } },
        animal: { select: { id: true, tag: true, name: true } },
        inventoryItem: { select: { id: true, name: true, currentStock: true, unit: true } },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    // Daily totals
    const totalCost = records.reduce((sum, r) => sum + Number(r.totalCost || 0), 0);

    return NextResponse.json({ success: true, data: records, totalCost });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch feed records' }, { status: 500 });
  }
}

// POST /api/goats/feed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, feedType, quantity, unit, costPerUnit, timeOfDay, penId, animalId, inventoryItemId, notes } = body;

    if (!feedType || !quantity || !unit) {
      return NextResponse.json({ success: false, error: 'Feed type, quantity, and unit are required' }, { status: 400 });
    }
    if (!penId && !animalId) {
      return NextResponse.json({ success: false, error: 'Specify a pen or an animal' }, { status: 400 });
    }

    const totalCost = costPerUnit && quantity ? parseFloat(costPerUnit) * parseFloat(quantity) : null;

    const record = await prisma.feedRecord.create({
      data: {
        date: date ? new Date(date) : new Date(),
        feedType,
        quantity: parseFloat(quantity),
        unit,
        costPerUnit: costPerUnit ? parseFloat(costPerUnit) : null,
        totalCost,
        timeOfDay: timeOfDay || 'MORNING',
        penId: penId || null,
        animalId: animalId || null,
        inventoryItemId: inventoryItemId || null,
        notes: notes || null,
      },
      include: {
        pen: { select: { id: true, name: true } },
        animal: { select: { id: true, tag: true, name: true } },
      },
    });

    // Deduct from inventory if linked
    if (inventoryItemId) {
      await prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { currentStock: { decrement: parseFloat(quantity) } },
      });
    }

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to log feed record' }, { status: 500 });
  }
}
