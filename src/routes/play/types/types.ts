import type { FormationBonus } from "$lib/types/formationData";
import type { UnitCustomization } from "$lib/types/listTypes";

type PlayUnit = {
	id: number;
	mulId: number;
	skill?: number;
	customization?: UnitCustomization;
	number?: number;
	pending: {
		damage: number;
		heat: number;
		crits: { id: number; round: number; type: string; roundsRemaining?: number }[];
	};
	current: {
		damage: number;
		heat: number;
		crits: { id: number; round: number; type: string; roundsRemaining?: number }[];
		disabledAbilities: string[];
	};
};

type PlayFormation = {
	id: string;
	name: string;
	type: string;
	units: PlayUnit[];
	secondary?: { type?: string; units?: PlayUnit[] };
	bonuses?: FormationBonus[];
};

type PlayList = {
	id: string;
	owner: string;
	team: number;
	formations: PlayFormation[];
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

type PlayMatch = {
	id: number;
	name: string;
	createdAt: Date;
};

export type { PlayMatch, PlayList, PlayFormation, PlayUnit, LogRound, LogEntry };
