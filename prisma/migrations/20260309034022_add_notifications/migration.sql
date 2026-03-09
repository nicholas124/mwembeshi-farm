-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ANIMAL_ADDED', 'ANIMAL_UPDATED', 'ANIMAL_DELETED', 'CROP_ADDED', 'CROP_UPDATED', 'CROP_DELETED', 'EXPENSE_ADDED', 'EXPENSE_UPDATED', 'EXPENSE_DELETED', 'INCOME_ADDED', 'INCOME_UPDATED', 'INCOME_DELETED', 'EQUIPMENT_ADDED', 'EQUIPMENT_UPDATED', 'EQUIPMENT_DELETED', 'TASK_ADDED', 'TASK_UPDATED', 'TASK_DELETED', 'INVENTORY_ADDED', 'INVENTORY_UPDATED', 'INVENTORY_DELETED', 'WORKER_ADDED', 'WORKER_UPDATED', 'WORKER_DELETED', 'GOAT_BREEDING', 'GOAT_DAILY_LOG', 'GOAT_INVENTORY', 'CROP_DAILY_LOG');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_isRead_createdAt_idx" ON "notifications"("isRead", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_createdById_idx" ON "notifications"("createdById");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
