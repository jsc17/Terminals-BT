export type LogEntry = {
	unitId: string;
	damageTaken?: number;
	crit?: string;
};

export type Options = {
	uiScale: number;
	renderOriginal: boolean;
	showPhysical: boolean;
};
