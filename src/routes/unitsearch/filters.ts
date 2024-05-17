import type { filter } from "$lib/types/filter";

const typeValues = [
	{ value: "any", display: "Any" },
	{ value: "AF", display: "Aerospace Fighter" },
	{ value: "BA", display: "Battle Armor" },
	{ value: "BS", display: "Battlefield Support" },
	{ value: "BM", display: "Battlemech" },
	{ value: "CI", display: "Combat Infantry" },
	{ value: "CV", display: "Combat Vehicle" },
	{ value: "IM", display: "Industrial Mech" },
	{ value: "PM", display: "Protomech" },
	{ value: "SV", display: "Support Vehicle" }
];
const rulesLevels = [
	{ value: "any", display: "Any" },
	{ value: "introductory", display: "Introductory" },
	{ value: "standard", display: "Standard" },
	{ value: "advanced", display: "Advanced" },
	{ value: "experimental", display: "Experimental" },
	{ value: "unknown", display: "Unknown" }
];
const technology = [
	{ value: "any", display: "Any" },
	{ value: "is", display: "Inner Sphere" },
	{ value: "clan", display: "Clan" },
	{ value: "mixed", display: "Mixed" },
	{ value: "prim", display: "Primitive" }
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
	{ name: "rulesLevel", label: "Rules", type: "select", value: "any", default: "any", possible: rulesLevels },
	{ name: "technology", label: "Technology", type: "select", value: "any", default: "any", possible: technology },
	{ name: "date", label: "Date", type: "min", value: 0, default: 0 },
	{ name: "tonnage", label: "Tonnage", type: "minMax", value: 0, default: 0, maxValue: 500, maxDefault: 500 },
	{ name: "abilities", label: "Abilities", type: "abilities", value: "", default: "" }
];
