/*
  Warnings:

  - Made the column `type` on table `CollectionModel` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `CollectionModel` MODIFY `type` VARCHAR(191) NOT NULL;
