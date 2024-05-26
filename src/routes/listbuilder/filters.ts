import type { filter } from "$lib/types/filter";

const typeValues = [
	{ value: "any", display: "Any" },
	{ value: "AF", display: "Aerospace Fighter", types: ["AF", "CF"] },
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
	{ name: "name", label: "Name", type: "string", value: "" },
	{ name: "type", label: "Type", type: "select", value: "any", possible: typeValues },
	{ name: "pv", label: "PV", type: "number", value: 0, maxValue: 100 },
	{ name: "move", label: "Move", type: "number", value: 0 },
	{ name: "tmm", label: "TMM", type: "number", value: 0 },
	{ name: "health", label: "Health", type: "number", value: 0 },
	{
		name: "damage",
		label: "Damage",
		type: "numberGroup",
		properties: ["damageS", "damageM", "damageL"],
		labels: ["S", "M", "L"],
		values: [{}, {}, {}],
		defaults: [0, 0, 0]
	},
	{ name: "size", label: "Size", type: "number", value: 0 },
	{ name: "rulesLevel", label: "Rules", type: "select", value: "any", possible: rulesLevels },
	{ name: "technology", label: "Technology", type: "select", value: "any", possible: technology },
	{ name: "date", label: "Date", type: "number", value: 0 },
	{ name: "tonnage", label: "Tonnage", type: "number", value: 0, maxValue: 500 },
	{ name: "abilities", label: "Abilities", type: "abilities", value: "" }
];
