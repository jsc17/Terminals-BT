/*
  Warnings:

  - You are about to drop the column `fixed` on the `Participant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Participant` DROP COLUMN `fixed`,
    ADD COLUMN `addedBfs` TEXT NULL,
    ADD COLUMN `bfs` TEXT NULL,
    ADD COLUMN `fixedBfs` TEXT NULL,
    ADD COLUMN `fixedUnits` TEXT NULL;
