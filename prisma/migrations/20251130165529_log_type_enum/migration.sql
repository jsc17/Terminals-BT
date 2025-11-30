/*
  Warnings:

  - You are about to alter the column `type` on the `MatchLog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to drop the `MatchMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `MatchMessage` DROP FOREIGN KEY `MatchMessage_matchId_fkey`;

-- AlterTable
ALTER TABLE `MatchLog` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `type` ENUM('MATCH_CREATED', 'MATCH_START', 'MATCH_UPDATE', 'MATCH_END', 'MATCH_DELETE', 'PLAYER_JOINED', 'PLAYER_LEFT', 'REMOVE_PLAYER', 'ROUND_END', 'UNIT_DAMAGE', 'UNIT_DAMAGE_REMOVED', 'UNIT_HEAT', 'UNIT_CRIT', 'UNIT_CRIT_REMOVED') NOT NULL;

-- DropTable
DROP TABLE `MatchMessage`;
