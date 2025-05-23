export type LogRound = {
	round: number;
	logs: LogEntry[];
};

export type LogEntry = {
	unitId: string;
	unitName: string;
	damageTaken?: number;
	crit?: { id: string; type: string; name: string; index?: number };
	applied: boolean;
	undone: boolean;
};

export type Options = {
	uiScale: number;
	renderOriginal: boolean;
	showPhysical: boolean;
	showCrippled: boolean;
	showJumpTMM: boolean;
	confirmEnd: boolean;
};
