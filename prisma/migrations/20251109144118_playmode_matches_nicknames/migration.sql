/*
  Warnings:

  - Added the required column `playerNickname` to the `UsersInMatch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UsersInMatch` ADD COLUMN `playerNickname` VARCHAR(191) NOT NULL;
