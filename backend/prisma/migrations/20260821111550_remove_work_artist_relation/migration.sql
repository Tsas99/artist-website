/*
  Warnings:

  - You are about to drop the column `artistId` on the `Work` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Work" DROP CONSTRAINT "Work_artistId_fkey";

-- AlterTable
ALTER TABLE "Work" DROP COLUMN "artistId";
