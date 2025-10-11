import type { MulUnit } from "$lib/types/listTypes";

export type ValidationUnitData = {
	id: string;
	name: string;
	mulData?: MulUnit;
	available?: boolean;
	unique?: boolean;
	skill: number;
	pv: number;
	link?: string;
};

export type TournamentData = {
	name: string;
	id: number;
	location?: string;
	era?: number;
	tournament_date: Date;
	tournamentRules: string;
};
