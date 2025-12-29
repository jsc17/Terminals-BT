import type { FormationBonus } from "$lib/types/formationData";
import type { MulUnit, UnitCustomization } from "$lib/types/listTypes";

type PlayUnitData = {
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

type PlayUnit = {
	data: PlayUnitData;
	reference?: MulUnit;
	image?: string;
	owner: string;
};

type PlayFormation = {
	id: string;
	name: string;
	type: string;
	units: number[];
	secondary?: { type?: string; units?: number[] };
	bonuses?: FormationBonus[];
};

type PlayList = {
	id: string;
	name: string;
	owner: number;
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

export type { PlayMatch, PlayList, PlayFormation, PlayUnitData, PlayUnit, LogRound, LogEntry };
