-- CreateTable
CREATE TABLE `Match` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `private` BOOLEAN NOT NULL DEFAULT true,
    `joinCode` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `currentRound` INTEGER NOT NULL,
    `gameCompleted` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsersInMatch` (
    `matchId` INTEGER NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `playerRole` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`matchId`, `playerId`)
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
    `formationId` INTEGER NOT NULL,
    `spas` VARCHAR(191) NOT NULL,
    `ammo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matchId` INTEGER NOT NULL,
    `unitId` INTEGER NOT NULL,
    `round` INTEGER NOT NULL,
    `applied` BOOLEAN NOT NULL,
    `rolledBack` BOOLEAN NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `damage` INTEGER NULL,
    `heat` INTEGER NULL,
    `critical` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UsersInMatch` ADD CONSTRAINT `UsersInMatch_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersInMatch` ADD CONSTRAINT `UsersInMatch_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchFormation` ADD CONSTRAINT `MatchFormation_matchId_playerId_fkey` FOREIGN KEY (`matchId`, `playerId`) REFERENCES `UsersInMatch`(`matchId`, `playerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchUnit` ADD CONSTRAINT `MatchUnit_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `MatchFormation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchLog` ADD CONSTRAINT `MatchLog_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchLog` ADD CONSTRAINT `MatchLog_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `MatchUnit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
