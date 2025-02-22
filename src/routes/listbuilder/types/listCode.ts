import type { UnitCustomization } from "$lib/types/unit";
import type { FormationV2 } from "./formation";
import type { SublistV2 } from "./sublist";

export type ListCodeUnit = {
	id: string;
	mulId: number;
	skill?: number;
	customization: UnitCustomization;
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
};
