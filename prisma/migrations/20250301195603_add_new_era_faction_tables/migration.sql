-- CreateTable
CREATE TABLE `Faction` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Era` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FactionInEra` (
    `eraId` INTEGER NOT NULL,
    `factionId` INTEGER NOT NULL,
    `general` INTEGER NOT NULL,
    `updated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`eraId`, `factionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Availability` (
    `unitId` INTEGER NOT NULL,
    `faction` INTEGER NOT NULL,
    `era` INTEGER NOT NULL,

    PRIMARY KEY (`unitId`, `faction`, `era`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FactionInEra` ADD CONSTRAINT `FactionInEra_eraId_fkey` FOREIGN KEY (`eraId`) REFERENCES `Era`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FactionInEra` ADD CONSTRAINT `FactionInEra_factionId_fkey` FOREIGN KEY (`factionId`) REFERENCES `Faction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Availability` ADD CONSTRAINT `Availability_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Availability` ADD CONSTRAINT `Availability_era_faction_fkey` FOREIGN KEY (`era`, `faction`) REFERENCES `FactionInEra`(`eraId`, `factionId`) ON DELETE RESTRICT ON UPDATE CASCADE;
