-- AlterTable
ALTER TABLE `User` ADD COLUMN `playModeNickname` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `Match` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `private` BOOLEAN NOT NULL,
    `joinCode` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `currentRound` INTEGER NOT NULL DEFAULT 0,
    `gameCompleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Match_name_key`(`name`),
    UNIQUE INDEX `Match_joinCode_key`(`joinCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsersInMatch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matchId` INTEGER NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `playerNickname` VARCHAR(191) NOT NULL,
    `playerFaction` VARCHAR(191) NULL,
    `playerRole` ENUM('HOST', 'MODERATOR', 'PLAYER') NOT NULL,
    `teamId` INTEGER NULL,

    UNIQUE INDEX `UsersInMatch_matchId_playerId_key`(`matchId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchTeam` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `objectivePoints` INTEGER NOT NULL DEFAULT 0,
    `matchId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchFormation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `secondaryType` VARCHAR(191) NULL,
    `matchId` INTEGER NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchUnit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mulId` INTEGER NOT NULL,
    `skill` INTEGER NOT NULL,
    `secondary` BOOLEAN NOT NULL,
    `pendingDamage` INTEGER NOT NULL DEFAULT 0,
    `pendingHeat` INTEGER NOT NULL DEFAULT 0,
    `currentDamage` INTEGER NOT NULL DEFAULT 0,
    `currentHeat` INTEGER NOT NULL DEFAULT 0,
    `formationId` INTEGER NOT NULL,
    `spas` VARCHAR(191) NULL,
    `ammo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchCrit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unitId` INTEGER NOT NULL,
    `round` INTEGER NOT NULL,
    `pending` BOOLEAN NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `roundsRemaining` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matchId` INTEGER NOT NULL,
    `submitterId` INTEGER NOT NULL,
    `round` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `unitId` INTEGER NULL,
    `applied` BOOLEAN NULL,
    `damage` INTEGER NULL,
    `heat` INTEGER NULL,
    `critical` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matchId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `data` VARCHAR(191) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UsersInMatch` ADD CONSTRAINT `UsersInMatch_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersInMatch` ADD CONSTRAINT `UsersInMatch_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersInMatch` ADD CONSTRAINT `UsersInMatch_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `MatchTeam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchTeam` ADD CONSTRAINT `MatchTeam_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchFormation` ADD CONSTRAINT `MatchFormation_matchId_playerId_fkey` FOREIGN KEY (`matchId`, `playerId`) REFERENCES `UsersInMatch`(`matchId`, `playerId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchUnit` ADD CONSTRAINT `MatchUnit_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `MatchFormation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchCrit` ADD CONSTRAINT `MatchCrit_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `MatchUnit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchLog` ADD CONSTRAINT `MatchLog_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchLog` ADD CONSTRAINT `MatchLog_submitterId_fkey` FOREIGN KEY (`submitterId`) REFERENCES `UsersInMatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchMessage` ADD CONSTRAINT `MatchMessage_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
