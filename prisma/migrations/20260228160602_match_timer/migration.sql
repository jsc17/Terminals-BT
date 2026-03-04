-- AlterTable
ALTER TABLE `Match` ADD COLUMN `matchDuration` INTEGER NULL,
    ADD COLUMN `timeEnded` DATETIME(3) NULL,
    ADD COLUMN `timeStarted` DATETIME(3) NULL;
