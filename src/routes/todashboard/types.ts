type Achievement<T> = {
	first?: T[];
	second?: T[];
	third?: T[];
};

type Achievements = {
	highestPVUnit: Achievement<{ unit: string; skill: number; pv: number; player: string }>;
	lowestPVList: Achievement<{ player: string; pv: number; unitCount: number }>;
};

export type TournamentStatistics = {
	achievements: Achievements;

	//statistics
	// mostCommonUnit: { unit: string; count: number }[];
};
