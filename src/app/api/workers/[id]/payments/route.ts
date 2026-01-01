import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payments = await prisma.payment.findMany({
      where: { workerId: params.id },
      orderBy: { paymentDate: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
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
      amount, 
      paymentType, 
      paymentDate, 
      periodStart, 
      periodEnd, 
      daysWorked,
      deductions,
      bonus,
      paymentMethod,
      reference,
      notes 
    } = body;

    // Validate required fields
    if (!amount || !paymentType) {
      return NextResponse.json(
        { success: false, error: 'Amount and payment type are required' },
        { status: 400 }
      );
    }

    // Check if worker exists
    const worker = await prisma.worker.findUnique({
      where: { id: params.id },
    });

    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        workerId: params.id,
        amount: parseFloat(amount),
        paymentType,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        periodStart: periodStart ? new Date(periodStart) : null,
        periodEnd: periodEnd ? new Date(periodEnd) : null,
        daysWorked: daysWorked ? parseInt(daysWorked) : null,
        deductions: deductions ? parseFloat(deductions) : null,
        bonus: bonus ? parseFloat(bonus) : null,
        paymentMethod,
        reference,
        notes,
      },
    });

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}
