/*
  Warnings:

  - You are about to alter the column `playerRole` on the `UsersInMatch` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Match` MODIFY `name` VARCHAR(191) NULL,
    ALTER COLUMN `private` DROP DEFAULT,
    MODIFY `joinCode` VARCHAR(191) NULL,
    MODIFY `currentRound` INTEGER NOT NULL DEFAULT 0,
    MODIFY `gameCompleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `playModeNickname` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `UsersInMatch` MODIFY `playerRole` ENUM('HOST', 'MODERATOR', 'PLAYER') NOT NULL;
