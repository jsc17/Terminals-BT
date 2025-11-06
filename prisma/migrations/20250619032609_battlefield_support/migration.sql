/*
  Warnings:

  - You are about to drop the `ListV2` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ListV2` DROP FOREIGN KEY `ListV2_userId_fkey`;

-- AlterTable
ALTER TABLE `ListV3` ADD COLUMN `bs` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `SharedList` ADD COLUMN `bs` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `ListV2`;
