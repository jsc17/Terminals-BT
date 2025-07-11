import type { UnitAbility } from "$lib/data/abilities";

type ListFormation = {
	id: string;
	name: string;
	type: string;
	units: { id: string }[];
	bonuses?: { spa: string; units: string[] }[];
	secondary?: { type: string; units: { id: string }[] };
};

type UnitCustomization = {
	spa?: string[];
	ammo?: string[];
	//eventually I might add the ability to customize stats on units
	custom?: string[];
};

type MulUnit = {
	[key: string]: any;
	id: number;
	mulId: number;
	name: string;
	group: string;
	class: string;
	variant: string;
	type: string;
	subtype: string;
	pv: number;
	size?: number;
	move?: { speed: number; type: string }[];
	tmm?: number;
	health?: number;
	armor?: number;
	structure?: number;
	damageS?: number;
	damageSMin?: boolean;
	damageM?: number;
	damageMMin?: boolean;
	damageL?: number;
	damageLMin?: boolean;
	damageE?: number;
	damageEMin?: boolean;
	overheat?: number;
	abilities: UnitAbility[];
	imageLink?: string;
	rulesLevel: string;
	tonnage?: number;
	date?: number;
	role?: string;
	technology?: string;
	availability?: { era: number; faction: number }[];
	threshold?: number;
};

type ListUnit = {
	id: string;
	baseUnit: MulUnit;
	skill?: number;
	cost: number;
	customization?: UnitCustomization;
};

type SCA = {
	id: number;
	name: string;
	page: string;
};

type Sublist = {
	id: string;
	checked: string[];
	scenario: string;
};

type SublistStats = {
	pv: number;
	health: number;
	short: number;
	medium: number;
	long: number;
	size: number;
};

type ListCodeUnit = {
	id: string;
	mulId: number;
	skill?: number;
	customization?: UnitCustomization;
};

type ListCode = {
	id: string;
	lcVersion: number;
	name: string;
	eras: number[];
	factions: number[];
	rules: string;
	units: ListCodeUnit[];
	formations: ListFormation[];
	sublists: Sublist[];
	scas?: number[];
	bs?: number[];
};

export type { ListFormation, ListUnit, MulUnit, SCA, SublistStats, Sublist, UnitCustomization, ListCode, ListCodeUnit };
