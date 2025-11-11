/*
  Warnings:

  - You are about to drop the column `team1Name` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team1ObjectivePoints` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team2Name` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team2ObjectivePoints` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team` on the `UsersInMatch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Match` DROP COLUMN `team1Name`,
    DROP COLUMN `team1ObjectivePoints`,
    DROP COLUMN `team2Name`,
    DROP COLUMN `team2ObjectivePoints`;

-- AlterTable
ALTER TABLE `UsersInMatch` DROP COLUMN `team`,
    ADD COLUMN `teamId` INTEGER NULL;

-- CreateTable
CREATE TABLE `MatchTeam` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `objectivePoints` INTEGER NOT NULL DEFAULT 0,
    `matchId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UsersInMatch` ADD CONSTRAINT `UsersInMatch_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `MatchTeam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchTeam` ADD CONSTRAINT `MatchTeam_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
