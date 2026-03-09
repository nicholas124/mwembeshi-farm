-- CreateEnum
CREATE TYPE "GoatActivity" AS ENUM ('FEEDING', 'WATERING', 'MILKING', 'CLEANING', 'HEALTH_CHECK', 'VACCINATION', 'DEWORMING', 'HOOF_TRIMMING', 'BREEDING', 'KIDDING_ASSIST', 'WEIGHING', 'MOVING_PASTURE', 'FENCE_REPAIR', 'SHELTER_MAINTENANCE', 'RECORD_KEEPING', 'MEDICATION', 'GROOMING', 'SORTING', 'OTHER');

-- CreateEnum
CREATE TYPE "DailyLogStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateTable
CREATE TABLE "goat_daily_logs" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "workerId" TEXT,
    "activity" "GoatActivity" NOT NULL,
    "description" TEXT,
    "goatsAffected" INTEGER,
    "animalId" TEXT,
    "timeSpent" DECIMAL(4,2),
    "status" "DailyLogStatus" NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goat_daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "goat_daily_logs_date_workerId_idx" ON "goat_daily_logs"("date", "workerId");

-- CreateIndex
CREATE INDEX "goat_daily_logs_date_activity_idx" ON "goat_daily_logs"("date", "activity");

-- AddForeignKey
ALTER TABLE "goat_daily_logs" ADD CONSTRAINT "goat_daily_logs_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goat_daily_logs" ADD CONSTRAINT "goat_daily_logs_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
