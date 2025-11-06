-- CreateTable
CREATE TABLE `SharedList` (
    `id` VARCHAR(191) NOT NULL,
    `lcVersion` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `eras` VARCHAR(191) NOT NULL,
    `factions` VARCHAR(191) NOT NULL,
    `units` MEDIUMTEXT NOT NULL,
    `formations` TEXT NOT NULL,
    `sublists` TEXT NULL,
    `rules` VARCHAR(191) NULL,
    `sharedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
