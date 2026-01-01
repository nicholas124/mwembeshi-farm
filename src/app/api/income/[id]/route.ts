import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/income/[id] - Get a single income record
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const income = await prisma.income.findUnique({
      where: { id: params.id },
    });

    if (!income) {
      return NextResponse.json(
        { success: false, error: 'Income record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: income,
    });
  } catch (error: any) {
    console.error('Error fetching income:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch income record' },
      { status: 500 }
    );
  }
}

// PUT /api/income/[id] - Update an income record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const {
      category,
      description,
      amount,
      paymentMethod,
      reference,
      buyer,
      incomeDate,
      notes,
    } = body;

    const income = await prisma.income.update({
      where: { id: params.id },
      data: {
        category,
        description,
        amount: amount ? parseFloat(amount) : undefined,
        paymentMethod,
        reference,
        buyer,
        incomeDate: incomeDate ? new Date(incomeDate) : undefined,
        notes,
      },
    });

    return NextResponse.json({
      success: true,
      data: income,
      message: 'Income record updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating income:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update income record' },
      { status: 500 }
    );
  }
}

// DELETE /api/income/[id] - Delete an income record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.income.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Income record deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting income:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete income record' },
      { status: 500 }
    );
  }
}
