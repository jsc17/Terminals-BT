-- CreateTable
CREATE TABLE `CustomCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pack` VARCHAR(191) NOT NULL,
    `mulId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `class` VARCHAR(191) NOT NULL,
    `variant` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `pv` INTEGER NOT NULL,
    `abilities` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CustomCard_mulId_key`(`mulId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
