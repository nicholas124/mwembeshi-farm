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

  // Create crop types - common Zambian crops with accurate growing days
  const cropTypes = [
    // Vegetables
    { name: 'Tomatoes', localName: 'Matimati', category: 'VEGETABLE', growingDays: 90, description: 'Popular market crop. Varieties: Money Maker, Roma, Tengeru' },
    { name: 'Onions', localName: 'Anyezi', category: 'VEGETABLE', growingDays: 150, description: 'Dry season crop. Varieties: Red Creole, Texas Grano' },
    { name: 'Rape', localName: 'Rape', category: 'VEGETABLE', growingDays: 42, description: 'Fast-growing leafy vegetable, high demand year-round' },
    { name: 'Cabbage', localName: 'Kabichi', category: 'VEGETABLE', growingDays: 90, description: 'Cool season preferred. Varieties: Copenhagen, Star 3301' },
    { name: 'Okra', localName: 'Therere', category: 'VEGETABLE', growingDays: 55, description: 'Heat-loving, does well in Zambian climate. Varieties: Clemson Spineless' },
    { name: 'Chinese Cabbage', localName: 'Chainizi', category: 'VEGETABLE', growingDays: 50, description: 'Fast-growing, very popular in Zambian markets' },
    { name: 'Green Pepper', localName: 'Pilipili ya green', category: 'VEGETABLE', growingDays: 80, description: 'Transplanted crop. Varieties: California Wonder' },
    { name: 'Eggplant', localName: 'Impwa', category: 'VEGETABLE', growingDays: 80, description: 'African eggplant varieties popular locally' },
    { name: 'Pumpkin', localName: 'Libushi', category: 'VEGETABLE', growingDays: 100, description: 'Leaves and fruit both consumed. Dual purpose crop' },
    { name: 'Butternut', localName: 'Butternut', category: 'VEGETABLE', growingDays: 90, description: 'Growing in popularity, good market price' },
    // Grains
    { name: 'Maize', localName: 'Chimanga', category: 'GRAIN', growingDays: 130, description: 'Staple crop. Varieties: SC513, SC403, MRI 634' },
    { name: 'Sorghum', localName: 'Amabele', category: 'GRAIN', growingDays: 120, description: 'Drought tolerant, good for dry areas' },
    { name: 'Wheat', localName: 'Wheat', category: 'GRAIN', growingDays: 120, description: 'Cool/dry season irrigated crop' },
    { name: 'Rice', localName: 'Mpunga', category: 'GRAIN', growingDays: 150, description: 'Grown in wetland areas. Varieties: SUPA, Nerica' },
    // Legumes
    { name: 'Green Beans', localName: 'Beans', category: 'LEGUME', growingDays: 60, description: 'Short season crop, good for intercropping' },
    { name: 'Groundnuts', localName: 'Nshawa', category: 'LEGUME', growingDays: 120, description: 'Varieties: Chalimbana, MGV4, Natal Common' },
    { name: 'Soybeans', localName: 'Soya', category: 'LEGUME', growingDays: 120, description: 'Commercial crop, good for rotation with maize' },
    { name: 'Cowpeas', localName: 'Nyemba', category: 'LEGUME', growingDays: 75, description: 'Drought tolerant, nitrogen-fixing' },
    // Tubers
    { name: 'Sweet Potato', localName: 'Mbambala', category: 'TUBER', growingDays: 120, description: 'Orange-fleshed varieties rich in Vitamin A' },
    { name: 'Cassava', localName: 'Katapa', category: 'TUBER', growingDays: 365, description: 'Long season crop, drought tolerant. Major staple in Northern Zambia' },
    { name: 'Irish Potato', localName: 'Katata', category: 'TUBER', growingDays: 100, description: 'Cool season crop. Grown commercially in Southern/Central' },
    // Other
    { name: 'Sunflower', localName: 'Sunflower', category: 'OTHER', growingDays: 100, description: 'Oilseed crop, grown for cooking oil production' },
    { name: 'Cotton', localName: 'Tamba', category: 'OTHER', growingDays: 150, description: 'Cash crop grown in Eastern, Central, and Southern provinces' },
    { name: 'Sugarcane', localName: 'Mishale', category: 'OTHER', growingDays: 365, description: 'Perennial crop, commercial production in Mazabuka area' },
  ];

  for (const crop of cropTypes) {
    await prisma.cropType.upsert({
      where: { name: crop.name },
      update: {
        localName: crop.localName,
        growingDays: crop.growingDays,
        description: crop.description,
      },
      create: {
        name: crop.name,
        localName: crop.localName,
        category: crop.category as any,
        growingDays: crop.growingDays,
        description: crop.description,
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
