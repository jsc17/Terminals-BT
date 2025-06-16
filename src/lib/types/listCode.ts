import type { UnitCustomization, FormationV2, SCA, SublistV2 } from "$lib/types/";

export type ListCodeUnit = {
	id: string;
	mulId: number;
	skill?: number;
	customization?: UnitCustomization;
};

export type ListCode = {
	id: string;
	lcVersion: number;
	name: string;
	eras: number[];
	factions: number[];
	rules: string;
	units: ListCodeUnit[];
	formations: FormationV2[];
	sublists: SublistV2[];
	scas?: number[];
};
