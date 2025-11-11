/*
  Warnings:

  - Added the required column `team1Name` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team1ObjectivePoints` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team2Name` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team2ObjectivePoints` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Match` ADD COLUMN `team1Name` VARCHAR(191) NOT NULL,
    ADD COLUMN `team1ObjectivePoints` INTEGER NOT NULL,
    ADD COLUMN `team2Name` VARCHAR(191) NOT NULL,
    ADD COLUMN `team2ObjectivePoints` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `UsersInMatch` ADD COLUMN `playerFaction` VARCHAR(191) NULL,
    ADD COLUMN `team` INTEGER NULL;
