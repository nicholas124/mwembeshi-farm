-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUPERVISOR', 'STAFF');

-- CreateEnum
CREATE TYPE "AnimalType" AS ENUM ('GOAT', 'COW', 'SHEEP', 'CHICKEN', 'PIG', 'OTHER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('ACTIVE', 'SOLD', 'DECEASED', 'TRANSFERRED', 'SLAUGHTERED');

-- CreateEnum
CREATE TYPE "AcquisitionMethod" AS ENUM ('PURCHASED', 'BORN', 'DONATED', 'TRADED');

-- CreateEnum
CREATE TYPE "TreatmentType" AS ENUM ('VACCINATION', 'DEWORMING', 'MEDICATION', 'SURGERY', 'CHECKUP', 'INJURY', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductionType" AS ENUM ('MILK', 'EGGS', 'WOOL', 'OTHER');

-- CreateEnum
CREATE TYPE "BreedingStatus" AS ENUM ('BRED', 'PREGNANT', 'BIRTHED', 'FAILED');

-- CreateEnum
CREATE TYPE "CropCategory" AS ENUM ('VEGETABLE', 'GRAIN', 'FRUIT', 'LEGUME', 'TUBER', 'OTHER');

-- CreateEnum
CREATE TYPE "IrrigationType" AS ENUM ('RAINFED', 'DRIP', 'SPRINKLER', 'FLOOD', 'MANUAL');

-- CreateEnum
CREATE TYPE "PlantingStatus" AS ENUM ('PLANNED', 'PLANTED', 'GROWING', 'HARVESTING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('LAND_PREP', 'PLANTING', 'WEEDING', 'FERTILIZING', 'SPRAYING', 'IRRIGATION', 'INSPECTION', 'OTHER');

-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('FERTILIZER', 'PESTICIDE', 'HERBICIDE', 'FUNGICIDE', 'SEED', 'OTHER');

-- CreateEnum
CREATE TYPE "HarvestQuality" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "SprayPlanStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "WorkerType" AS ENUM ('PERMANENT', 'CASUAL', 'SEASONAL', 'CONTRACT');

-- CreateEnum
CREATE TYPE "WorkerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'SICK', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('SALARY', 'WAGE', 'BONUS', 'ADVANCE', 'OVERTIME', 'OTHER');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('LIVESTOCK', 'CROPS', 'EQUIPMENT', 'MAINTENANCE', 'GENERAL', 'ADMINISTRATIVE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('VEHICLE', 'TRACTOR', 'HAND_TOOL', 'POWER_TOOL', 'IRRIGATION', 'STORAGE', 'PROCESSING', 'OTHER');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'BROKEN', 'RETIRED');

-- CreateEnum
CREATE TYPE "EquipmentCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE', 'REPAIR', 'INSPECTION', 'REPLACEMENT', 'CLEANING', 'OTHER');

-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('FEED', 'FERTILIZER', 'PESTICIDE', 'SEEDS', 'FUEL', 'MEDICINE', 'SPARE_PARTS', 'PACKAGING', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'USAGE', 'ADJUSTMENT', 'TRANSFER', 'WASTE', 'RETURN');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('LIVESTOCK', 'CROPS', 'LABOR', 'EQUIPMENT', 'FUEL', 'UTILITIES', 'TRANSPORT', 'VETERINARY', 'SEEDS_FERTILIZER', 'REPAIRS', 'OTHER');

-- CreateEnum
CREATE TYPE "IncomeCategory" AS ENUM ('LIVESTOCK_SALE', 'CROP_SALE', 'MILK_SALE', 'EGG_SALE', 'PRODUCE_SALE', 'SERVICES', 'OTHER');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT,
    "type" "AnimalType" NOT NULL,
    "breed" TEXT,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "dateAcquired" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acquisitionMethod" "AcquisitionMethod" NOT NULL DEFAULT 'BORN',
    "purchasePrice" DECIMAL(10,2),
    "status" "AnimalStatus" NOT NULL DEFAULT 'ACTIVE',
    "motherId" TEXT,
    "fatherId" TEXT,
    "color" TEXT,
    "weight" DECIMAL(8,2),
    "notes" TEXT,
    "photo" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatments" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "type" "TreatmentType" NOT NULL,
    "description" TEXT NOT NULL,
    "medication" TEXT,
    "dosage" TEXT,
    "cost" DECIMAL(10,2),
    "treatmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextDueDate" TIMESTAMP(3),
    "veterinarian" TEXT,
    "administeredById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_records" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "weight" DECIMAL(8,2) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "weight_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productions" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "type" "ProductionType" NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breeding_records" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "maleId" TEXT,
    "breedingDate" TIMESTAMP(3) NOT NULL,
    "expectedDue" TIMESTAMP(3),
    "actualBirthDate" TIMESTAMP(3),
    "offspring" INTEGER DEFAULT 0,
    "notes" TEXT,
    "status" "BreedingStatus" NOT NULL DEFAULT 'BRED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breeding_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "localName" TEXT,
    "category" "CropCategory" NOT NULL,
    "growingDays" INTEGER,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crop_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fields" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" DECIMAL(10,4) NOT NULL,
    "location" TEXT,
    "soilType" TEXT,
    "irrigation" "IrrigationType" NOT NULL DEFAULT 'RAINFED',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantings" (
    "id" TEXT NOT NULL,
    "cropTypeId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "plantingDate" TIMESTAMP(3) NOT NULL,
    "expectedHarvest" TIMESTAMP(3),
    "areaPlanted" DECIMAL(10,4) NOT NULL,
    "seedQuantity" DECIMAL(10,2),
    "seedUnit" TEXT,
    "seedCost" DECIMAL(10,2),
    "status" "PlantingStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "season" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plantings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_activities" (
    "id" TEXT NOT NULL,
    "plantingId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "description" TEXT,
    "activityDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cost" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crop_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_inputs" (
    "id" TEXT NOT NULL,
    "plantingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InputType" NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "cost" DECIMAL(10,2),
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "crop_inputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "harvests" (
    "id" TEXT NOT NULL,
    "plantingId" TEXT NOT NULL,
    "harvestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "quality" "HarvestQuality" NOT NULL DEFAULT 'GOOD',
    "soldQuantity" DECIMAL(12,2),
    "soldPrice" DECIMAL(12,2),
    "buyer" TEXT,
    "harvestedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "harvests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spray_plans" (
    "id" TEXT NOT NULL,
    "plantingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pesticide" TEXT NOT NULL,
    "targetPest" TEXT,
    "dosage" TEXT NOT NULL,
    "applicationMethod" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" "SprayPlanStatus" NOT NULL DEFAULT 'PENDING',
    "completedDate" TIMESTAMP(3),
    "completedById" TEXT,
    "weatherConditions" TEXT,
    "safetyPrecautions" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spray_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "nrc" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "hireDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" TEXT NOT NULL,
    "workerType" "WorkerType" NOT NULL DEFAULT 'PERMANENT',
    "dailyRate" DECIMAL(10,2),
    "monthlyRate" DECIMAL(10,2),
    "status" "WorkerStatus" NOT NULL DEFAULT 'ACTIVE',
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "photo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "hoursWorked" DECIMAL(4,2),
    "overtime" DECIMAL(4,2),
    "notes" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "daysWorked" INTEGER,
    "deductions" DECIMAL(10,2),
    "bonus" DECIMAL(10,2),
    "paymentMethod" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "TaskCategory" NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedHours" DECIMAL(5,2),
    "actualHours" DECIMAL(5,2),
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_workers" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DECIMAL(12,2),
    "currentValue" DECIMAL(12,2),
    "location" TEXT,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "condition" "EquipmentCondition" NOT NULL DEFAULT 'GOOD',
    "lastServiceDate" TIMESTAMP(3),
    "nextServiceDate" TIMESTAMP(3),
    "notes" TEXT,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenances" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "description" TEXT NOT NULL,
    "performedBy" TEXT,
    "cost" DECIMAL(10,2),
    "parts" TEXT,
    "maintenanceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextDueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_usage" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "usedById" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "checkoutTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnTime" TIMESTAMP(3),
    "hoursUsed" DECIMAL(6,2),
    "fuelUsed" DECIMAL(8,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "category" "InventoryCategory" NOT NULL,
    "currentStock" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "minStock" DECIMAL(12,2),
    "maxStock" DECIMAL(12,2),
    "unitCost" DECIMAL(10,2),
    "location" TEXT,
    "supplier" TEXT,
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unitCost" DECIMAL(10,2),
    "totalCost" DECIMAL(12,2),
    "reference" TEXT,
    "supplier" TEXT,
    "notes" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" TEXT,
    "reference" TEXT,
    "vendor" TEXT,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receipt" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" TEXT NOT NULL,
    "category" "IncomeCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" TEXT,
    "reference" TEXT,
    "buyer" TEXT,
    "incomeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "data" JSONB,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SyncStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "animals_tag_key" ON "animals"("tag");

-- CreateIndex
CREATE INDEX "animals_type_status_idx" ON "animals"("type", "status");

-- CreateIndex
CREATE INDEX "animals_tag_idx" ON "animals"("tag");

-- CreateIndex
CREATE INDEX "treatments_animalId_treatmentDate_idx" ON "treatments"("animalId", "treatmentDate");

-- CreateIndex
CREATE INDEX "weight_records_animalId_recordedAt_idx" ON "weight_records"("animalId", "recordedAt");

-- CreateIndex
CREATE INDEX "productions_animalId_type_recordedAt_idx" ON "productions"("animalId", "type", "recordedAt");

-- CreateIndex
CREATE INDEX "breeding_records_animalId_breedingDate_idx" ON "breeding_records"("animalId", "breedingDate");

-- CreateIndex
CREATE UNIQUE INDEX "crop_types_name_key" ON "crop_types"("name");

-- CreateIndex
CREATE INDEX "plantings_cropTypeId_status_idx" ON "plantings"("cropTypeId", "status");

-- CreateIndex
CREATE INDEX "plantings_fieldId_plantingDate_idx" ON "plantings"("fieldId", "plantingDate");

-- CreateIndex
CREATE INDEX "crop_activities_plantingId_activityDate_idx" ON "crop_activities"("plantingId", "activityDate");

-- CreateIndex
CREATE INDEX "crop_inputs_plantingId_appliedDate_idx" ON "crop_inputs"("plantingId", "appliedDate");

-- CreateIndex
CREATE INDEX "harvests_plantingId_harvestDate_idx" ON "harvests"("plantingId", "harvestDate");

-- CreateIndex
CREATE INDEX "spray_plans_plantingId_scheduledDate_idx" ON "spray_plans"("plantingId", "scheduledDate");

-- CreateIndex
CREATE INDEX "spray_plans_status_idx" ON "spray_plans"("status");

-- CreateIndex
CREATE UNIQUE INDEX "workers_employeeId_key" ON "workers"("employeeId");

-- CreateIndex
CREATE INDEX "attendances_workerId_date_idx" ON "attendances"("workerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_workerId_date_key" ON "attendances"("workerId", "date");

-- CreateIndex
CREATE INDEX "payments_workerId_paymentDate_idx" ON "payments"("workerId", "paymentDate");

-- CreateIndex
CREATE INDEX "tasks_status_dueDate_idx" ON "tasks"("status", "dueDate");

-- CreateIndex
CREATE INDEX "tasks_category_status_idx" ON "tasks"("category", "status");

-- CreateIndex
CREATE UNIQUE INDEX "task_workers_taskId_workerId_key" ON "task_workers"("taskId", "workerId");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_code_key" ON "equipment"("code");

-- CreateIndex
CREATE INDEX "equipment_category_status_idx" ON "equipment"("category", "status");

-- CreateIndex
CREATE INDEX "maintenances_equipmentId_maintenanceDate_idx" ON "maintenances"("equipmentId", "maintenanceDate");

-- CreateIndex
CREATE INDEX "equipment_usage_equipmentId_checkoutTime_idx" ON "equipment_usage"("equipmentId", "checkoutTime");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_sku_key" ON "inventory_items"("sku");

-- CreateIndex
CREATE INDEX "inventory_items_category_currentStock_idx" ON "inventory_items"("category", "currentStock");

-- CreateIndex
CREATE INDEX "inventory_transactions_itemId_transactionDate_idx" ON "inventory_transactions"("itemId", "transactionDate");

-- CreateIndex
CREATE INDEX "expenses_category_expenseDate_idx" ON "expenses"("category", "expenseDate");

-- CreateIndex
CREATE INDEX "incomes_category_incomeDate_idx" ON "incomes"("category", "incomeDate");

-- CreateIndex
CREATE INDEX "sync_logs_deviceId_status_idx" ON "sync_logs"("deviceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_administeredById_fkey" FOREIGN KEY ("administeredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productions" ADD CONSTRAINT "productions_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantings" ADD CONSTRAINT "plantings_cropTypeId_fkey" FOREIGN KEY ("cropTypeId") REFERENCES "crop_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantings" ADD CONSTRAINT "plantings_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_activities" ADD CONSTRAINT "crop_activities_plantingId_fkey" FOREIGN KEY ("plantingId") REFERENCES "plantings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_inputs" ADD CONSTRAINT "crop_inputs_plantingId_fkey" FOREIGN KEY ("plantingId") REFERENCES "plantings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_plantingId_fkey" FOREIGN KEY ("plantingId") REFERENCES "plantings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_harvestedById_fkey" FOREIGN KEY ("harvestedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spray_plans" ADD CONSTRAINT "spray_plans_plantingId_fkey" FOREIGN KEY ("plantingId") REFERENCES "plantings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spray_plans" ADD CONSTRAINT "spray_plans_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_workers" ADD CONSTRAINT "task_workers_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_workers" ADD CONSTRAINT "task_workers_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_usage" ADD CONSTRAINT "equipment_usage_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_usage" ADD CONSTRAINT "equipment_usage_usedById_fkey" FOREIGN KEY ("usedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
