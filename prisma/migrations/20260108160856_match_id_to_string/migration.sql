/*
  Warnings:

  - The primary key for the `Match` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `MatchList` DROP FOREIGN KEY `MatchList_matchId_playerId_fkey`;

-- DropForeignKey
ALTER TABLE `MatchLog` DROP FOREIGN KEY `MatchLog_matchId_fkey`;

-- DropForeignKey
ALTER TABLE `MatchTeam` DROP FOREIGN KEY `MatchTeam_matchId_fkey`;

-- DropForeignKey
ALTER TABLE `UsersInMatch` DROP FOREIGN KEY `UsersInMatch_matchId_fkey`;

-- DropIndex
DROP INDEX `Match_joinCode_key` ON `Match`;

-- DropIndex
DROP INDEX `MatchList_matchId_playerId_fkey` ON `MatchList`;

-- DropIndex
DROP INDEX `MatchLog_matchId_fkey` ON `MatchLog`;

-- DropIndex
DROP INDEX `MatchTeam_matchId_fkey` ON `MatchTeam`;

-- AlterTable
ALTER TABLE `Match` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `MatchList` MODIFY `matchId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `MatchLog` MODIFY `matchId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `MatchTeam` MODIFY `matchId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `UsersInMatch` MODIFY `matchId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `UsersInMatch` ADD CONSTRAINT `UsersInMatch_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchTeam` ADD CONSTRAINT `MatchTeam_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchList` ADD CONSTRAINT `MatchList_matchId_playerId_fkey` FOREIGN KEY (`matchId`, `playerId`) REFERENCES `UsersInMatch`(`matchId`, `playerId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchLog` ADD CONSTRAINT `MatchLog_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
