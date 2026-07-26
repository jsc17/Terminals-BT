-- CreateTable
CREATE TABLE `MatchRoundSummary` (
    `id` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,
    `round` INTEGER NOT NULL,
    `timeElapsedMS` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchRoundSummaryTeam` (
    `id` VARCHAR(191) NOT NULL,
    `roundSummaryId` VARCHAR(191) NOT NULL,
    `teamId` INTEGER NOT NULL,
    `unitsRemaining` INTEGER NOT NULL,
    `pvRemaining` INTEGER NOT NULL,
    `objectivePoints` INTEGER NOT NULL,
    `unitUpdates` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MatchRoundSummary` ADD CONSTRAINT `MatchRoundSummary_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchRoundSummaryTeam` ADD CONSTRAINT `MatchRoundSummaryTeam_roundSummaryId_fkey` FOREIGN KEY (`roundSummaryId`) REFERENCES `MatchRoundSummary`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchRoundSummaryTeam` ADD CONSTRAINT `MatchRoundSummaryTeam_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `MatchTeam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
