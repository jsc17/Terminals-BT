-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `hashedPassword` VARCHAR(191) NULL,
    `google_id` VARCHAR(191) NULL,
    `discord_id` VARCHAR(191) NULL,
    `account_created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_login` DATETIME(3) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_google_id_key`(`google_id`),
    UNIQUE INDEX `User_discord_id_key`(`discord_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `valid` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListV2` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lcVersion` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `era` INTEGER NULL,
    `faction` INTEGER NULL,
    `general` INTEGER NULL,
    `units` MEDIUMTEXT NOT NULL,
    `formations` TEXT NOT NULL,
    `sublists` TEXT NULL,
    `rules` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListV3` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lcVersion` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `eras` VARCHAR(191) NOT NULL,
    `factions` VARCHAR(191) NOT NULL,
    `units` MEDIUMTEXT NOT NULL,
    `formations` TEXT NOT NULL,
    `sublists` TEXT NULL,
    `rules` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tournament` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `organizer` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `era` INTEGER NOT NULL,
    `tournament_date` DATE NOT NULL,
    `passed` BOOLEAN NULL,
    `private` BOOLEAN NOT NULL,
    `display_email` BOOLEAN NOT NULL,
    `allow_resubmission` BOOLEAN NOT NULL,
    `require_email` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TournamentParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournamentId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `participantId` INTEGER NOT NULL,
    `valid` BOOLEAN NOT NULL,
    `issues` VARCHAR(191) NULL,
    `units` VARCHAR(191) NOT NULL,
    `era` INTEGER NOT NULL,
    `faction` INTEGER NOT NULL,
    `message` VARCHAR(500) NULL,
    `dateSubmitted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mulId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `class` VARCHAR(191) NOT NULL,
    `variant` VARCHAR(191) NULL,
    `technology` VARCHAR(191) NULL,
    `rules` VARCHAR(191) NULL,
    `date_introduced` INTEGER NULL,
    `role` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `subtype` VARCHAR(191) NULL,
    `size` INTEGER NOT NULL,
    `move` VARCHAR(191) NOT NULL,
    `tmm` INTEGER NOT NULL,
    `armor` INTEGER NOT NULL,
    `structure` INTEGER NOT NULL,
    `threshold` INTEGER NOT NULL,
    `damage_s` INTEGER NOT NULL,
    `damage_s_min` BOOLEAN NOT NULL,
    `damage_m` INTEGER NOT NULL,
    `damage_m_min` BOOLEAN NOT NULL,
    `damage_l` INTEGER NOT NULL,
    `damage_l_min` BOOLEAN NOT NULL,
    `damage_e` INTEGER NOT NULL,
    `damage_e_min` BOOLEAN NOT NULL,
    `overheat` INTEGER NOT NULL,
    `pv` INTEGER NOT NULL,
    `abilities` VARCHAR(191) NULL,
    `tonnage` INTEGER NULL DEFAULT 0,
    `image_url` VARCHAR(191) NULL,

    UNIQUE INDEX `Unit_mulId_key`(`mulId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faction` (
    `id` VARCHAR(191) NOT NULL,
    `era` INTEGER NOT NULL,
    `faction` INTEGER NOT NULL,
    `general` INTEGER NOT NULL,
    `updated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FactionToUnit` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_FactionToUnit_AB_unique`(`A`, `B`),
    INDEX `_FactionToUnit_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResetToken` ADD CONSTRAINT `ResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListV2` ADD CONSTRAINT `ListV2_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListV3` ADD CONSTRAINT `ListV3_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tournament` ADD CONSTRAINT `Tournament_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TournamentParticipant` ADD CONSTRAINT `TournamentParticipant_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `Tournament`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TournamentParticipant` ADD CONSTRAINT `TournamentParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListCode` ADD CONSTRAINT `ListCode_participantId_fkey` FOREIGN KEY (`participantId`) REFERENCES `TournamentParticipant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FactionToUnit` ADD CONSTRAINT `_FactionToUnit_A_fkey` FOREIGN KEY (`A`) REFERENCES `Faction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FactionToUnit` ADD CONSTRAINT `_FactionToUnit_B_fkey` FOREIGN KEY (`B`) REFERENCES `Unit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

