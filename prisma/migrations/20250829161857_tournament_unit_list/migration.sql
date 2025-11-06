/*
  Warnings:

  - Added the required column `fixed` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `units` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Participant` ADD COLUMN `fixed` BOOLEAN NOT NULL,
    ADD COLUMN `units` VARCHAR(191) NOT NULL;
