import type { FormationBonus } from "$lib/types/formationData";
import type { UnitCustomization } from "$lib/types/listTypes";

type PlayUnit = {
	id: string;
	mulId: string;
	skill?: number;
	cost: number;
	customization?: UnitCustomization;
	number?: number;
	pending: {
		damage: number;
		heat: number;
		crits: { id: string; type: string }[];
	};
	current: {
		damage: number;
		heat: number;
		crits: { id: string; type: string }[];
		disabledAbilities: string[];
	};
};

type PlayFormation = {
	id: string;
	name: string;
	type: string;
	units: string[];
	secondary?: { type?: string; units?: string[] };
	bonuses?: FormationBonus[];
};

type PlayList = {
	id: string;
	name: string;
	date: string;
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
	damageUndone?: number;
	crit?: { id: string; type: string; name: string; index?: number };
	applied: boolean;
	undone: boolean;
};

type Options = {
	cardsPerRow: number;
	uiScale: number;
	renderOriginal: boolean;
	showPhysical: boolean;
	showCrippled: boolean;
	showJumpTMM: boolean;
	confirmEnd: boolean;
	groupByFormation: boolean;
	damageDirection: "left" | "right";
	measurementUnits: "inches" | "hexes";
	duplicateUnitMarkings: "numbers" | "letters" | "roman";
};

export type { PlayList, PlayFormation, PlayUnit, LogRound, LogEntry, Options };
