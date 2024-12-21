import { type Formation } from "$lib/types/formation.svelte";

export type Unit = {
	[key: string]: any;
	id?: number;
	mulId: number;
	name: string;
	class: string;
	variant: string;
	type: string;
	subtype: string;
	pv: number;
	cost: number;
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
	overheat?: number;
	abilities: string;
	skill?: number;
	imageLink?: string;
	rulesLevel: string;
	tonnage?: number;
	date?: number;
	role?: string;
	technology?: string;
	subIndex?: number;
	availability?: { era: number; faction: number }[];
	spa?: string[];
	ammo?: string[];
};

export function isUnit(item: Unit | Formation): item is Unit {
	return "mulId" in item;
}
