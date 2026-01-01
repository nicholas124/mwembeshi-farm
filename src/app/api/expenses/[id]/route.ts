import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/expenses/[id] - Get a single expense
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
    });

    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error: any) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update an expense
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
      vendor,
      expenseDate,
      receipt,
      notes,
    } = body;

    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        category,
        description,
        amount: amount ? parseFloat(amount) : undefined,
        paymentMethod,
        reference,
        vendor,
        expenseDate: expenseDate ? new Date(expenseDate) : undefined,
        receipt,
        notes,
      },
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Expense updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.expense.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
