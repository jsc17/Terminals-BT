/*
  Warnings:

  - You are about to drop the column `message` on the `MatchMessage` table. All the data in the column will be lost.
  - Added the required column `data` to the `MatchMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MatchMessage` DROP COLUMN `message`,
    ADD COLUMN `data` VARCHAR(191) NOT NULL;
