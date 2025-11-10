-- DropForeignKey
ALTER TABLE `MatchFormation` DROP FOREIGN KEY `MatchFormation_matchId_playerId_fkey`;

-- DropForeignKey
ALTER TABLE `MatchLog` DROP FOREIGN KEY `MatchLog_matchId_fkey`;

-- DropForeignKey
ALTER TABLE `MatchLog` DROP FOREIGN KEY `MatchLog_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `MatchUnit` DROP FOREIGN KEY `MatchUnit_formationId_fkey`;

-- DropForeignKey
ALTER TABLE `UsersInMatch` DROP FOREIGN KEY `UsersInMatch_matchId_fkey`;

-- DropForeignKey
ALTER TABLE `UsersInMatch` DROP FOREIGN KEY `UsersInMatch_playerId_fkey`;

-- DropIndex
DROP INDEX `MatchFormation_matchId_playerId_fkey` ON `MatchFormation`;

-- DropIndex
DROP INDEX `MatchLog_matchId_fkey` ON `MatchLog`;

-- DropIndex
DROP INDEX `MatchLog_unitId_fkey` ON `MatchLog`;

-- DropIndex
DROP INDEX `MatchUnit_formationId_fkey` ON `MatchUnit`;

-- DropIndex
DROP INDEX `UsersInMatch_playerId_fkey` ON `UsersInMatch`;

-- AddForeignKey
ALTER TABLE `UsersInMatch` ADD CONSTRAINT `UsersInMatch_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersInMatch` ADD CONSTRAINT `UsersInMatch_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchFormation` ADD CONSTRAINT `MatchFormation_matchId_playerId_fkey` FOREIGN KEY (`matchId`, `playerId`) REFERENCES `UsersInMatch`(`matchId`, `playerId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchUnit` ADD CONSTRAINT `MatchUnit_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `MatchFormation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchLog` ADD CONSTRAINT `MatchLog_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchLog` ADD CONSTRAINT `MatchLog_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `MatchUnit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
