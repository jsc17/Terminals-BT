/*
  Warnings:

  - You are about to drop the `Faction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FactionToUnit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_FactionToUnit` DROP FOREIGN KEY `_FactionToUnit_A_fkey`;

-- DropForeignKey
ALTER TABLE `_FactionToUnit` DROP FOREIGN KEY `_FactionToUnit_B_fkey`;

-- DropTable
DROP TABLE `Faction`;

-- DropTable
DROP TABLE `_FactionToUnit`;
