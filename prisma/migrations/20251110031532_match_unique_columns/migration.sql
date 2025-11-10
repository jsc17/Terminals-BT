/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Match` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[joinCode]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Match_name_key` ON `Match`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Match_joinCode_key` ON `Match`(`joinCode`);
