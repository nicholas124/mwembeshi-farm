import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/goats/sales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const animalId = searchParams.get('animalId');

    const records = await prisma.saleRecord.findMany({
      where: animalId ? { animalId } : undefined,
      include: {
        animal: { select: { id: true, tag: true, name: true, breed: true, gender: true, dateOfBirth: true } },
      },
      orderBy: { saleDate: 'desc' },
    });

    const totalRevenue = records.reduce((sum, r) => sum + Number(r.salePrice), 0);
    const totalNet = records.reduce((sum, r) => sum + Number(r.netAmount || r.salePrice), 0);

    return NextResponse.json({ success: true, data: records, totalRevenue, totalNet });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sales' }, { status: 500 });
  }
}

// POST /api/goats/sales
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      animalId, saleDate, salePrice, saleType,
      buyerName, buyerPhone, buyerLocation,
      weightAtSale, ageAtSale,
      transportCost, marketFee, paymentMethod, paymentStatus,
      reason, notes,
    } = body;

    if (!animalId || !salePrice) {
      return NextResponse.json({ success: false, error: 'Animal and sale price are required' }, { status: 400 });
    }

    const price = parseFloat(salePrice);
    const transport = transportCost ? parseFloat(transportCost) : 0;
    const fee = marketFee ? parseFloat(marketFee) : 0;
    const netAmount = price - transport - fee;

    const record = await prisma.saleRecord.create({
      data: {
        animalId,
        saleDate: saleDate ? new Date(saleDate) : new Date(),
        salePrice: price,
        saleType: saleType || 'DIRECT',
        buyerName: buyerName || null,
        buyerPhone: buyerPhone || null,
        buyerLocation: buyerLocation || null,
        weightAtSale: weightAtSale ? parseFloat(weightAtSale) : null,
        ageAtSale: ageAtSale ? parseInt(ageAtSale) : null,
        transportCost: transport || null,
        marketFee: fee || null,
        netAmount,
        paymentMethod: paymentMethod || null,
        paymentStatus: paymentStatus || 'PAID',
        reason: reason || null,
        notes: notes || null,
      },
      include: {
        animal: { select: { id: true, tag: true, name: true, breed: true } },
      },
    });

    // Mark animal as SOLD
    await prisma.animal.update({ where: { id: animalId }, data: { status: 'SOLD' } });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'A sale record already exists for this animal' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to record sale' }, { status: 500 });
  }
}
