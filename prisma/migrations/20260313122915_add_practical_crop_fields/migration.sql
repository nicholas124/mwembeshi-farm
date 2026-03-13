-- CreateEnum
CREATE TYPE "PlantingMethod" AS ENUM ('DIRECT_SEEDING', 'TRANSPLANTING', 'BROADCASTING', 'DIBBLING');

-- CreateEnum
CREATE TYPE "CropHealth" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL');

-- AlterTable
ALTER TABLE "plantings" ADD COLUMN     "basalFertilizer" TEXT,
ADD COLUMN     "expectedYield" DECIMAL(10,2),
ADD COLUMN     "health" "CropHealth" NOT NULL DEFAULT 'GOOD',
ADD COLUMN     "plantingMethod" "PlantingMethod" NOT NULL DEFAULT 'DIRECT_SEEDING',
ADD COLUMN     "seedSource" TEXT,
ADD COLUMN     "seedTreatment" TEXT,
ADD COLUMN     "spacingPlants" DECIMAL(6,1),
ADD COLUMN     "spacingRows" DECIMAL(6,1),
ADD COLUMN     "topDressFertilizer" TEXT,
ADD COLUMN     "variety" TEXT;
