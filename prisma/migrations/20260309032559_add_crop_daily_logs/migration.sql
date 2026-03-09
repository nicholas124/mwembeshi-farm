-- CreateEnum
CREATE TYPE "CropDailyActivity" AS ENUM ('LAND_PREP', 'PLANTING', 'TRANSPLANTING', 'WEEDING', 'FERTILIZING', 'SPRAYING', 'IRRIGATION', 'PRUNING', 'MULCHING', 'HARVESTING', 'DRYING', 'PEST_CONTROL', 'DISEASE_CONTROL', 'SOIL_TESTING', 'COMPOSTING', 'FENCE_REPAIR', 'FIELD_INSPECTION', 'RECORD_KEEPING', 'OTHER');

-- CreateTable
CREATE TABLE "crop_daily_logs" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "workerId" TEXT,
    "activity" "CropDailyActivity" NOT NULL,
    "description" TEXT,
    "plantingId" TEXT,
    "fieldId" TEXT,
    "areaWorked" DECIMAL(10,4),
    "timeSpent" DECIMAL(4,2),
    "status" "DailyLogStatus" NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "crop_daily_logs_date_workerId_idx" ON "crop_daily_logs"("date", "workerId");

-- CreateIndex
CREATE INDEX "crop_daily_logs_date_activity_idx" ON "crop_daily_logs"("date", "activity");

-- AddForeignKey
ALTER TABLE "crop_daily_logs" ADD CONSTRAINT "crop_daily_logs_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_daily_logs" ADD CONSTRAINT "crop_daily_logs_plantingId_fkey" FOREIGN KEY ("plantingId") REFERENCES "plantings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_daily_logs" ADD CONSTRAINT "crop_daily_logs_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;
