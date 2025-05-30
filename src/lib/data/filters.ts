import type { Filter } from "../../filter";

//if types field doesn't exist, will check against value
export const typeValues = [
	{ value: "AF", label: "Aerospace Fighter" },
	{ value: "CF", label: "Conventional Fighter" },
	{ value: "BA", label: "Battle Armor" },
	{ value: "BS", label: "Battlefield Support" },
	{ value: "BM", label: "Battlemech" },
	{ value: "CI", label: "Combat Infantry" },
	{ value: "CV", label: "Combat Vehicle" },
	{ value: "IM", label: "Industrial Mech" },
	{ value: "PM", label: "Protomech" },
	{ value: "SV", label: "Support Vehicle" }
];
const rulesLevels = [
	{ value: "Introductory", label: "Introductory" },
	{ value: "Standard", label: "Standard" },
	{ value: "Advanced", label: "Advanced" },
	{ value: "Experimental", label: "Experimental" },
	{ value: "Unknown", label: "Unknown" }
];
const technology = [
	{ value: "Inner Sphere", label: "Inner Sphere" },
	{ value: "Clan", label: "Clan" },
	{ value: "Mixed", label: "Mixed" },
	{ value: "Primative", label: "Primitive" }
];

const roles = [
	{ value: "Scout", label: "Scout" },
	{ value: "Striker", label: "Striker" },
	{ value: "Missile Boat", label: "Missile Boat" },
	{ value: "Sniper", label: "Sniper" },
	{ value: "Brawler", label: "Brawler" },
	{ value: "Ambusher", label: "Ambusher" },
	{ value: "Skirmisher", label: "Skirmisher" },
	{ value: "Juggernaut", label: "Juggernaut" },
	{ value: "Interceptor", label: "Interceptor" },
	{ value: "Fast Dogfighter", label: "Fast Dogfighter" },
	{ value: "Dogfighter", label: "Dogfighter" },
	{ value: "Fire-Support", label: "Fire-Support" },
	{ value: "Attack", label: "Attack" },
	{ value: "Transport", label: "Transport" }
];

const movementTypes = [
	{ value: "j", label: "Jump" },
	{ value: "h", label: "Hover" },
	{ value: "t", label: "Tracked" },
	{ value: "v", label: "VTOL" },
	{ value: "w", label: "Wheeled" },
	{ value: "g", label: "WiGE" },
	{ value: "f", label: "Foot" },
	{ value: "m", label: "Motorized" },
	{ value: "s", label: "Submersible" },
	{ value: "a", label: "Aerodyne" },
	{ value: "i", label: "Airship" },
	{ value: "p", label: "Spheriod" }
];

export const filters: Filter[] = [
	{ name: "name", label: "Name", type: "string", value: "" },
	{ name: "subtype", label: "Type", type: "select", value: [], possibleValues: typeValues },
	{ name: "pv", label: "PV", type: "number" },
	{ name: "move", label: "Move", type: "movement", typeValue: [], possibleTypeValues: movementTypes },
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
	{ name: "role", label: "Role", type: "select", value: [], possibleValues: roles },
	{ name: "rulesLevel", label: "Rules", type: "select", value: [], possibleValues: rulesLevels },
	{ name: "technology", label: "Technology", type: "select", value: [], possibleValues: technology },
	{ name: "tonnage", label: "Tonnage", type: "number" },
	{ name: "unique", label: "Allow Uniques", type: "unique", checked: true }
];
