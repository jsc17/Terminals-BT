/*
  Warnings:

  - Added the required column `teamId` to the `MatchList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MatchList` ADD COLUMN `teamId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `MatchLog` MODIFY `type` ENUM('MATCH_CREATED', 'MATCH_START', 'MATCH_UPDATE', 'MATCH_END', 'MATCH_DELETE', 'PLAYER_JOINED', 'PLAYER_ADDED_LIST', 'PLAYER_LEFT', 'REMOVE_PLAYER', 'ROUND_END', 'UNIT_DAMAGE', 'UNIT_DAMAGE_REMOVED', 'UNIT_HEAT', 'UNIT_CRIT', 'UNIT_CRIT_REMOVED') NOT NULL;

-- AddForeignKey
ALTER TABLE `MatchList` ADD CONSTRAINT `MatchList_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `MatchTeam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
