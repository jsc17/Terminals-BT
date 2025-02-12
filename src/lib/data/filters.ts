import type { Filter } from "$lib/types/filter";

//if types field doesn't exist, will check against value
export const typeValues = [
	{ value: "any", display: "Any" },
	{ value: "AF", display: "Aerospace Fighter" },
	{ value: "CF", display: "Conventional Fighter" },
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
	{ value: "inner sphere", display: "Inner Sphere" },
	{ value: "clan", display: "Clan" },
	{ value: "mixed", display: "Mixed" },
	{ value: "primative", display: "Primitive" }
];

const roles = [
	{ value: "any", display: "Any" },
	{ value: "Scout", display: "Scout" },
	{ value: "Striker", display: "Striker" },
	{ value: "Missile Boat", display: "Missile Boat" },
	{ value: "Sniper", display: "Sniper" },
	{ value: "Brawler", display: "Brawler" },
	{ value: "Ambusher", display: "Ambusher" },
	{ value: "Skirmisher", display: "Skirmisher" },
	{ value: "Juggernaut", display: "Juggernaut" },
	{ value: "Interceptor", display: "Interceptor" },
	{ value: "Fast Dogfighter", display: "Fast Dogfighter" },
	{ value: "Dogfighter", display: "Dogfighter" },
	{ value: "Fire-Support", display: "Fire-Support" },
	{ value: "Attack", display: "Attack" },
	{ value: "Transport", display: "Transport" }
];

const movementTypes = [
	{ value: "any", display: "Any" },
	{ value: "j", display: "Jump" },
	{ value: "h", display: "Hover" },
	{ value: "t", display: "Tracked" },
	{ value: "v", display: "VTOL" },
	{ value: "w", display: "Wheeled" },
	{ value: "g", display: "WiGE" },
	{ value: "f", display: "Foot" },
	{ value: "m", display: "Motorized" },
	{ value: "s", display: "Submersible" },

]

export const filters: Filter[] = [
	{ name: "name", label: "Name", type: "string", value: "" },
	{ name: "subtype", label: "Type", type: "select", value: "any", possibleValues: typeValues },
	{ name: "pv", label: "PV", type: "number" },
	{ name: "move", label: "Move", type: "movement", typeValue: "any", possibleTypeValues: movementTypes },
	{ name: "tmm", label: "TMM", type: "number" },
	{ name: "health", label: "Health", type: "number" },
	{
		name: "damage",
		label: "Damage",
		type: "numberGroup",
		properties: ["damageS", "damageM", "damageL"],
		labels: ["S", "M", "L"],
		values: [{}, {}, {}],
		defaults: [0, 0, 0]
	},
	{ name: "size", label: "Size", type: "number" },
	{ name: "abilities", label: "Abilities", type: "abilities", value: "" }
];

export const additionalFilters: Filter[] = [
	{ name: "date", label: "Date Introduced", type: "number" },
	{ name: "role", label: "Role", type: "select", value: "any", possibleValues: roles },
	{ name: "rulesLevel", label: "Rules", type: "select", value: "any", possibleValues: rulesLevels },
	{ name: "technology", label: "Technology", type: "select", value: "any", possibleValues: technology },
	{ name: "tonnage", label: "Tonnage", type: "number" },
	{ name: "unique", label: "Allow Uniques", type: "unique", checked: true }
];
