-- AlterTable
ALTER TABLE "Work" ADD COLUMN     "mediums" TEXT[] DEFAULT ARRAY[]::TEXT[];
