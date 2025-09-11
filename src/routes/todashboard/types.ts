type Achievements = {
	highestPVUnit: [string, { player: string; unit: string; skill: number; pv: number }[]][];
	lowestPVList: [string, { player: string; pv: number; unitCount: number }[]][];
	mostCommonUnit: [string, { unit: string; count: number }[]][];
};

type BreakDown = {
	group: string;
	value: number;
	percent: number;
};

type Breakdowns = {
	eraList: BreakDown[];
	factionList: BreakDown[];
	unitTypes: BreakDown[];
};

export type TournamentStatistics = {
	achievements: Achievements;
	breakdowns: Breakdowns;
};
