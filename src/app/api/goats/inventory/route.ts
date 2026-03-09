import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// GET /api/goats/inventory - List goat-specific inventory items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const where: Record<string, unknown> = {
      isActive: true,
      sku: { startsWith: 'GOAT-' },
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.AND = [
        where.AND || {},
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { supplier: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const total = await prisma.inventoryItem.count({ where });

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
          take: 5,
        },
      },
      orderBy: [
        { name: 'asc' },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Manually filter low stock if requested
    const filteredItems = lowStock
      ? items.filter(item => item.minStock && parseFloat(item.currentStock.toString()) <= parseFloat(item.minStock.toString()))
      : items;

    // Get summary stats
    const allGoatItems = await prisma.inventoryItem.findMany({
      where: { isActive: true, sku: { startsWith: 'GOAT-' } },
      select: { currentStock: true, minStock: true, unitCost: true, category: true },
    });

    const totalItems = allGoatItems.length;
    const lowStockCount = allGoatItems.filter(
      i => i.minStock && parseFloat(i.currentStock.toString()) <= parseFloat(i.minStock.toString())
    ).length;
    const totalValue = allGoatItems.reduce((sum, i) => {
      const cost = i.unitCost ? parseFloat(i.unitCost.toString()) : 0;
      const stock = parseFloat(i.currentStock.toString());
      return sum + (cost * stock);
    }, 0);
    const categoryBreakdown = allGoatItems.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      items: filteredItems,
      total: lowStock ? filteredItems.length : total,
      page,
      pageSize,
      stats: {
        totalItems,
        lowStockCount,
        totalValue: Math.round(totalValue * 100) / 100,
        categoryBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching goat inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goat inventory' },
      { status: 500 }
    );
  }
}

// POST /api/goats/inventory - Create a new goat inventory item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Auto-generate GOAT-prefixed SKU if not provided
    const sku = body.sku
      ? (body.sku.startsWith('GOAT-') ? body.sku : `GOAT-${body.sku}`)
      : `GOAT-${Date.now().toString(36).toUpperCase()}`;

    const item = await prisma.inventoryItem.create({
      data: {
        name: body.name,
        sku,
        category: body.category || 'OTHER',
        currentStock: body.currentStock || 0,
        unit: body.unit || 'pieces',
        minStock: body.minStock || null,
        maxStock: body.maxStock || null,
        unitCost: body.unitCost || null,
        location: body.location || 'Goat Section',
        supplier: body.supplier || null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        notes: body.notes || null,
      },
    });

    await createNotification({
      type: 'GOAT_INVENTORY',
      title: 'Goat Inventory Item Added',
      message: `Goat inventory item "${item.name}" was added`,
      entityType: 'goat_inventory',
      entityId: item.id,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating goat inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}
