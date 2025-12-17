/*
  Warnings:

  - You are about to drop the column `affectedUser` on the `MatchLog` table. All the data in the column will be lost.
  - You are about to drop the column `critical` on the `MatchLog` table. All the data in the column will be lost.
  - You are about to drop the column `damage` on the `MatchLog` table. All the data in the column will be lost.
  - You are about to drop the column `heat` on the `MatchLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `MatchLog` DROP COLUMN `affectedUser`,
    DROP COLUMN `critical`,
    DROP COLUMN `damage`,
    DROP COLUMN `heat`,
    ADD COLUMN `details` JSON NULL;
