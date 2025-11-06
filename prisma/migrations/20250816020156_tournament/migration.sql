/*
  Warnings:

  - You are about to drop the column `allow_resubmission` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `display_email` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `organizer` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `passed` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `private` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `require_email` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the `ListCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TournamentParticipant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tournamentRules` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ListCode` DROP FOREIGN KEY `ListCode_participantId_fkey`;

-- DropForeignKey
ALTER TABLE `TournamentParticipant` DROP FOREIGN KEY `TournamentParticipant_tournamentId_fkey`;

-- DropForeignKey
ALTER TABLE `TournamentParticipant` DROP FOREIGN KEY `TournamentParticipant_userId_fkey`;

-- AlterTable
ALTER TABLE `Tournament` DROP COLUMN `allow_resubmission`,
    DROP COLUMN `display_email`,
    DROP COLUMN `organizer`,
    DROP COLUMN `passed`,
    DROP COLUMN `private`,
    DROP COLUMN `require_email`,
    ADD COLUMN `emailSubject` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `tournamentRules` VARCHAR(191) NOT NULL,
    MODIFY `era` INTEGER NULL;

-- DropTable
DROP TABLE `ListCode`;

-- DropTable
DROP TABLE `TournamentParticipant`;
