/*
  Warnings:

  - A unique constraint covering the columns `[responseToken]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Participant_responseToken_key` ON `Participant`(`responseToken`);
