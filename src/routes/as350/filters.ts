import type { filter } from "$lib/types/filter";
import type { Unit } from "$lib/types/unit";

const typeValues = [
	{ value: "any", display: "Any" },
	{ value: "BA", display: "Battle Armor" },
	{ value: "BS", display: "Battlefield Support" },
	{ value: "BM", display: "Battlemech" },
	{ value: "CI", display: "Combat Infantry" },
	{ value: "CV", display: "Combat Vehicle" },
	{ value: "IM", display: "Industrial Mech" },
	{ value: "PM", display: "Protomech" }
];

export const filters: filter[] = [
	{ name: "name", label: "Name", type: "string", value: "", default: "" },
	{ name: "type", label: "Type", type: "select", value: "any", default: "any", possible: typeValues },
	{ name: "pv", label: "PV", type: "minMax", value: 0, default: 0, maxValue: 100, maxDefault: 100 },
	{ name: "move", label: "Move", type: "min", value: 0, default: 0 },
	{ name: "tmm", label: "TMM", type: "min", value: 0, default: 0 },
	{ name: "health", label: "Health", type: "min", value: 0, default: 0 },
	{
		name: "damage",
		label: "Damage",
		type: "minGroup",
		value: 0,
		default: 0,
		properties: ["damageS", "damageM", "damageL"],
		labels: ["S", "M", "L"],
		values: [0, 0, 0],
		defaults: [0, 0, 0]
	},
	{ name: "size", label: "Size", type: "min", value: 0, default: 0 },
	{ name: "abilities", label: "Abilities", type: "abilities", value: "", default: "" }
];

const allowedTypes = ["BA", "BM", "CV", "CI", "IM", "IM", "PM"];
const allowedRules = ["Introductory", "Advanced", "Standard"];

export function restrictions(unit: Unit, unique: boolean) {
	if (unique || !allowedRules.includes(unit.rulesLevel!) || !allowedTypes.includes(unit.type) || unit.abilities.includes("DRO")) {
		return false;
	}
	return true;
}
