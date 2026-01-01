import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mwembishifarm.com' },
    update: {},
    create: {
      email: 'admin@mwembishifarm.com',
      name: 'Farm Administrator',
      phone: '+260970000000',
      role: 'ADMIN',
      password: adminPassword,
      language: 'en',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create crop types
  const cropTypes = [
    { name: 'Tomatoes', localName: 'Matimati', category: 'VEGETABLE', growingDays: 90 },
    { name: 'Onions', localName: 'Anyezi', category: 'VEGETABLE', growingDays: 120 },
    { name: 'Maize', localName: 'Chimanga', category: 'GRAIN', growingDays: 120 },
    { name: 'Rape', localName: 'Rape', category: 'VEGETABLE', growingDays: 45 },
    { name: 'Cabbage', localName: 'Kabichi', category: 'VEGETABLE', growingDays: 90 },
    { name: 'Green Beans', localName: 'Beans', category: 'LEGUME', growingDays: 60 },
    { name: 'Sweet Potato', localName: 'Mbambala', category: 'TUBER', growingDays: 120 },
    { name: 'Groundnuts', localName: 'Nshawa', category: 'LEGUME', growingDays: 120 },
  ];

  for (const crop of cropTypes) {
    await prisma.cropType.upsert({
      where: { name: crop.name },
      update: {},
      create: {
        name: crop.name,
        localName: crop.localName,
        category: crop.category as any,
        growingDays: crop.growingDays,
      },
    });
  }
  console.log('✅ Created crop types');

  // Create fields
  const fields = [
    { name: 'Field A', size: 2.5, location: 'North section', irrigation: 'DRIP' },
    { name: 'Field B', size: 3.0, location: 'East section', irrigation: 'RAINFED' },
    { name: 'Field C', size: 1.5, location: 'South section', irrigation: 'MANUAL' },
    { name: 'Field D', size: 4.0, location: 'West section', irrigation: 'SPRINKLER' },
    { name: 'Vegetable Garden', size: 0.5, location: 'Near farmhouse', irrigation: 'DRIP' },
  ];

  for (const field of fields) {
    await prisma.field.upsert({
      where: { id: field.name.toLowerCase().replace(' ', '-') },
      update: {},
      create: {
        name: field.name,
        size: field.size,
        location: field.location,
        irrigation: field.irrigation as any,
      },
    });
  }
  console.log('✅ Created fields');

  // Create sample animals
  const animals = [
    { tag: 'GT-0001', name: 'Bella', type: 'GOAT', breed: 'Boer', gender: 'FEMALE' },
    { tag: 'GT-0002', type: 'GOAT', breed: 'Local', gender: 'MALE' },
    { tag: 'GT-0003', type: 'GOAT', breed: 'Boer Cross', gender: 'FEMALE' },
    { tag: 'CW-0001', name: 'Daisy', type: 'COW', breed: 'Brahman', gender: 'FEMALE' },
    { tag: 'CW-0002', name: 'Bruno', type: 'COW', breed: 'Holstein', gender: 'MALE' },
    { tag: 'SP-0001', type: 'SHEEP', breed: 'Dorper', gender: 'FEMALE' },
    { tag: 'SP-0002', type: 'SHEEP', breed: 'Local', gender: 'MALE' },
    { tag: 'CH-0001', type: 'CHICKEN', breed: 'Village', gender: 'FEMALE' },
  ];

  for (const animal of animals) {
    await prisma.animal.upsert({
      where: { tag: animal.tag },
      update: {},
      create: {
        tag: animal.tag,
        name: animal.name,
        type: animal.type as any,
        breed: animal.breed,
        gender: animal.gender as any,
        status: 'ACTIVE',
        acquisitionMethod: 'PURCHASED',
        recordedById: admin.id,
      },
    });
  }
  console.log('✅ Created sample animals');

  // Create sample workers
  const workers = [
    { firstName: 'John', lastName: 'Mulenga', position: 'Farm Supervisor', workerType: 'PERMANENT', monthlyRate: 3500 },
    { firstName: 'Mary', lastName: 'Banda', position: 'Livestock Handler', workerType: 'PERMANENT', monthlyRate: 2500 },
    { firstName: 'Peter', lastName: 'Chileshe', position: 'Field Worker', workerType: 'PERMANENT', dailyRate: 100 },
    { firstName: 'Grace', lastName: 'Tembo', position: 'Field Worker', workerType: 'CASUAL', dailyRate: 80 },
    { firstName: 'David', lastName: 'Phiri', position: 'Security', workerType: 'PERMANENT', monthlyRate: 2000 },
  ];

  let employeeNum = 1;
  for (const worker of workers) {
    await prisma.worker.upsert({
      where: { employeeId: `EMP-${String(employeeNum).padStart(4, '0')}` },
      update: {},
      create: {
        employeeId: `EMP-${String(employeeNum).padStart(4, '0')}`,
        firstName: worker.firstName,
        lastName: worker.lastName,
        position: worker.position,
        workerType: worker.workerType as any,
        dailyRate: worker.dailyRate,
        monthlyRate: worker.monthlyRate,
        status: 'ACTIVE',
      },
    });
    employeeNum++;
  }
  console.log('✅ Created sample workers');

  // Create sample equipment
  const equipment = [
    { name: 'Tractor', code: 'TRC-001', category: 'TRACTOR', brand: 'John Deere', purchasePrice: 150000 },
    { name: 'Water Pump', code: 'PMP-001', category: 'IRRIGATION', brand: 'Honda', purchasePrice: 5000 },
    { name: 'Sprayer', code: 'SPR-001', category: 'HAND_TOOL', brand: 'Solo', purchasePrice: 800 },
    { name: 'Wheelbarrow', code: 'WBR-001', category: 'HAND_TOOL', purchasePrice: 350 },
    { name: 'Hoe Set', code: 'HOE-001', category: 'HAND_TOOL', purchasePrice: 200 },
    { name: 'Pickup Truck', code: 'VEH-001', category: 'VEHICLE', brand: 'Toyota', purchasePrice: 85000 },
  ];

  for (const item of equipment) {
    await prisma.equipment.upsert({
      where: { code: item.code },
      update: {},
      create: {
        name: item.name,
        code: item.code,
        category: item.category as any,
        brand: item.brand,
        purchasePrice: item.purchasePrice,
        currentValue: item.purchasePrice,
        status: 'AVAILABLE',
        condition: 'GOOD',
      },
    });
  }
  console.log('✅ Created sample equipment');

  // Create inventory items
  const inventory = [
    { name: 'Dairy Feed', category: 'FEED', currentStock: 500, unit: 'kg', minStock: 100 },
    { name: 'Layer Feed', category: 'FEED', currentStock: 200, unit: 'kg', minStock: 50 },
    { name: 'NPK Fertilizer', category: 'FERTILIZER', currentStock: 150, unit: 'kg', minStock: 50 },
    { name: 'Urea', category: 'FERTILIZER', currentStock: 100, unit: 'kg', minStock: 30 },
    { name: 'Diesel', category: 'FUEL', currentStock: 200, unit: 'liters', minStock: 50 },
    { name: 'Dewormer', category: 'MEDICINE', currentStock: 20, unit: 'bottles', minStock: 5 },
  ];

  for (const item of inventory) {
    await prisma.inventoryItem.upsert({
      where: { sku: item.name.toUpperCase().replace(' ', '-') },
      update: {},
      create: {
        name: item.name,
        sku: item.name.toUpperCase().replace(' ', '-'),
        category: item.category as any,
        currentStock: item.currentStock,
        unit: item.unit,
        minStock: item.minStock,
      },
    });
  }
  console.log('✅ Created inventory items');

  // Create default settings
  const settings = [
    { key: 'farm_name', value: 'Mwembeshi Farm', type: 'string' },
    { key: 'farm_location', value: 'Mwembeshi, Zambia', type: 'string' },
    { key: 'currency', value: 'ZMW', type: 'string' },
    { key: 'default_language', value: 'en', type: 'string' },
    { key: 'working_hours_start', value: '06:00', type: 'string' },
    { key: 'working_hours_end', value: '17:00', type: 'string' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ Created default settings');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
