import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/expenses - Get all expenses with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) {
        where.expenseDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.expenseDate.lte = new Date(endDate);
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: {
        expenseDate: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!category || !description || !amount) {
      return NextResponse.json(
        { success: false, error: 'Category, description, and amount are required' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        amount: parseFloat(amount),
        paymentMethod,
        reference,
        vendor,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        receipt,
        notes,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: expense,
        message: 'Expense created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create expense' },
      { status: 500 }
    );
  }
}
