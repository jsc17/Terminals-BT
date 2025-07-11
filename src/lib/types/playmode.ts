import type { UnitCustomization } from "./listTypes";

type PlayUnit = {
	id: string;
	mulId: string;
	skill?: number;
	cost: number;
	customization?: UnitCustomization;
	pending: {
		damage: number;
		heat: number;
		crits: { id: string; type: string }[];
	};
	current: {
		damage: number;
		heat: number;
		crits: { id: string; type: string }[];
	};
};

type PlayFormation = {
	id: string;
	name: string;
	type: string;
	units: string[];
	secondary?: { type?: string; units?: string[] };
};

type PlayList = {
	formations: PlayFormation[];
	units: PlayUnit[];
};
type LogRound = {
	round: number;
	logs: LogEntry[];
};

type LogEntry = {
	unitId: string;
	unitName: string;
	damageTaken?: number;
	crit?: { id: string; type: string; name: string; index?: number };
	applied: boolean;
	undone: boolean;
};

type Options = {
	uiScale: number;
	renderOriginal: boolean;
	showPhysical: boolean;
	showCrippled: boolean;
	showJumpTMM: boolean;
	confirmEnd: boolean;
	groupByFormation: boolean;
};

export type { PlayList, PlayFormation, PlayUnit, LogRound, LogEntry, Options };
