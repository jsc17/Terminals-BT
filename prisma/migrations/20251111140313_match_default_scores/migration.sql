-- AlterTable
ALTER TABLE `Match` MODIFY `team1ObjectivePoints` INTEGER NOT NULL DEFAULT 0,
    MODIFY `team2ObjectivePoints` INTEGER NOT NULL DEFAULT 0;
