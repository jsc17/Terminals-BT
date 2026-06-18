-- AlterTable
ALTER TABLE `Participant` ADD COLUMN `teamName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Tournament` ADD COLUMN `teams` BOOLEAN NOT NULL DEFAULT false;
