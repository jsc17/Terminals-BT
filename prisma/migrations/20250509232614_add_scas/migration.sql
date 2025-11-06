/*
  Warnings:

  - Made the column `sublists` on table `SharedList` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rules` on table `SharedList` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `SharedList` MODIFY `sublists` TEXT NOT NULL,
    MODIFY `rules` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ListV3` ADD COLUMN `scas` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `SharedList` ADD COLUMN `scas` VARCHAR(191) NULL;