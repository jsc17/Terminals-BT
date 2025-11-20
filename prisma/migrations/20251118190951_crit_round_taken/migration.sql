/*
  Warnings:

  - Added the required column `round` to the `MatchCrit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MatchCrit` ADD COLUMN `round` INTEGER NOT NULL;
