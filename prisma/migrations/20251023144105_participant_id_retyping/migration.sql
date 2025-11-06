/*
  Warnings:

  - The primary key for the `Participant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `listName` on the `Participant` table. All the data in the column will be lost.
  - You are about to drop the column `responseToken` on the `Participant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Participant_responseToken_key` ON `Participant`;

-- AlterTable
ALTER TABLE `Participant` DROP PRIMARY KEY,
    DROP COLUMN `listName`,
    DROP COLUMN `responseToken`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
