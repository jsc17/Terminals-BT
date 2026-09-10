/*
  Warnings:

  - You are about to drop the `SPA` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `SPA`;

-- CreateTable
CREATE TABLE `UnitAbility` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unitId` INTEGER NOT NULL,
    `abilityId` VARCHAR(191) NOT NULL,
    `value` INTEGER NULL,
    `valueMin` BOOLEAN NULL,
    `short` INTEGER NULL,
    `shortMin` BOOLEAN NULL,
    `medium` INTEGER NULL,
    `mediumMin` BOOLEAN NULL,
    `long` INTEGER NULL,
    `longMin` BOOLEAN NULL,
    `extreme` INTEGER NULL,
    `extremeMin` BOOLEAN NULL,
    `lamData` VARCHAR(191) NULL,
    `artilleryType` VARCHAR(191) NULL,
    `turretId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AbilityData` (
    `name` VARCHAR(191) NOT NULL,
    `abbreviation` VARCHAR(191) NOT NULL,
    `page` VARCHAR(191) NOT NULL,
    `weapon` BOOLEAN NOT NULL,
    `ammo` BOOLEAN NOT NULL,
    `numbered` BOOLEAN NOT NULL,

    PRIMARY KEY (`abbreviation`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SpecialPilotAbility` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `cost` INTEGER NOT NULL,
    `page` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `SpecialPilotAbility_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SpecialPilotAbilityToUnit` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_SpecialPilotAbilityToUnit_AB_unique`(`A`, `B`),
    INDEX `_SpecialPilotAbilityToUnit_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UnitAbility` ADD CONSTRAINT `UnitAbility_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UnitAbility` ADD CONSTRAINT `UnitAbility_abilityId_fkey` FOREIGN KEY (`abilityId`) REFERENCES `AbilityData`(`abbreviation`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UnitAbility` ADD CONSTRAINT `UnitAbility_turretId_fkey` FOREIGN KEY (`turretId`) REFERENCES `UnitAbility`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SpecialPilotAbilityToUnit` ADD CONSTRAINT `_SpecialPilotAbilityToUnit_A_fkey` FOREIGN KEY (`A`) REFERENCES `SpecialPilotAbility`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SpecialPilotAbilityToUnit` ADD CONSTRAINT `_SpecialPilotAbilityToUnit_B_fkey` FOREIGN KEY (`B`) REFERENCES `Unit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
