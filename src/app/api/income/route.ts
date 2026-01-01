import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/income - Get all income records with filtering
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
      where.incomeDate = {};
      if (startDate) {
        where.incomeDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.incomeDate.lte = new Date(endDate);
      }
    }

    const income = await prisma.income.findMany({
      where,
      orderBy: {
        incomeDate: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: income,
      count: income.length,
    });
  } catch (error: any) {
    console.error('Error fetching income:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch income' },
      { status: 500 }
    );
  }
}

// POST /api/income - Create a new income record
export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!category || !description || !amount) {
      return NextResponse.json(
        { success: false, error: 'Category, description, and amount are required' },
        { status: 400 }
      );
    }

    const income = await prisma.income.create({
      data: {
        category,
        description,
        amount: parseFloat(amount),
        paymentMethod,
        reference,
        buyer,
        incomeDate: incomeDate ? new Date(incomeDate) : new Date(),
        notes,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: income,
        message: 'Income record created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating income:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create income record' },
      { status: 500 }
    );
  }
}
