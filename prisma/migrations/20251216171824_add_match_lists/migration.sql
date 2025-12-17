/*
  Warnings:

  - You are about to drop the column `matchId` on the `MatchFormation` table. All the data in the column will be lost.
  - You are about to drop the column `playerId` on the `MatchFormation` table. All the data in the column will be lost.
  - Added the required column `listId` to the `MatchFormation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `MatchFormation` DROP FOREIGN KEY `MatchFormation_matchId_playerId_fkey`;

-- DropIndex
DROP INDEX `MatchFormation_matchId_playerId_fkey` ON `MatchFormation`;

-- AlterTable
ALTER TABLE `MatchFormation` DROP COLUMN `matchId`,
    DROP COLUMN `playerId`,
    ADD COLUMN `listId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `MatchList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matchId` INTEGER NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MatchList` ADD CONSTRAINT `MatchList_matchId_playerId_fkey` FOREIGN KEY (`matchId`, `playerId`) REFERENCES `UsersInMatch`(`matchId`, `playerId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchFormation` ADD CONSTRAINT `MatchFormation_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `MatchList`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
