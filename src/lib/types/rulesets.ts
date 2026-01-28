type Limit = {
	types: string[];
	min?: number | `${number}%`;
	max?: number | `${number}%`;
	equal?: number[];
	exceptions?: { ability: { name: string; min: number; max: number }[] };
	requirements?: { skill?: { min?: number; max?: number }; pv?: { min?: number; max?: number } };
};

export type Ruleset = {
	name: string;
	display: string;
	shortDisplay: string;
	singleEraFaction?: boolean;
	eraFactionRestriction?: boolean;
	maxPv?: number;
	maxUnits?: number;
	allowedTypes?: string[];
	allowedRules?: string[];
	disallowUnique?: boolean;
	disallowedAbilities?: string[];
	customUnitPacks?: string[];
	maxSkill?: number;
	minSkill?: number;
	unitLimits?: Limit[];
	unitPvLimits?: Limit[];
	chassisLimits?: Limit[];
	variantLimits?: Limit[];
	skillLimits?: Limit[];
	requireHitch?: boolean;
	abilityLimits?: Limit[];
	uniqueMaxLimit?: number;
	unitMinPV?: number;
	sublistMaxUnits?: number;
	sublistMaxPv?: number;
	sublistScenarios?: string[];
};

export const ruleSets: Ruleset[] = [
	{
		name: "noRes",
		display: "No Restrictions",
		shortDisplay: "-",
		eraFactionRestriction: true,
		sublistScenarios: []
	},
	// {
	// 	name: "wn350",
	// 	display: "Wolfnet 350 v2.3",
	// 	singleEraFaction: true,
	// 	eraFactionRestriction: true,
	// 	maxPv: 350,
	// 	maxUnits: 16,
	// 	allowedTypes: ["BA", "BM", "CV", "CI", "IM", "PM", "BS"],
	// 	allowedRules: ["Introductory", "Advanced", "Standard"],
	// 	disallowUnique: true,
	// 	disallowedAbilities: ["DRO"],
	// 	customUnitPacks: ["wn350"],
	// 	maxSkill: 6,
	// 	minSkill: 2,
	// 	unitLimits: [
	// 		{ types: ["BM", "IM"], max: 12 },
	// 		{ types: ["CV"], max: 8 },
	// 		{ types: ["BA", "CI"], max: 5 },
	// 		{ types: ["PM"], equal: [0, 5] }
	// 	],
	// 	chassisLimits: [{ types: ["All"], max: 2 }],
	// 	variantLimits: [{ types: ["BM", "IM"], max: 1 }],
	// 	skillLimits: [{ types: ["2", "6"], max: 2 }],
	// 	requireHitch: true,
	// 	abilityLimits: [{ types: ["JMPS"], max: 2 }],
	// 	sublistMaxUnits: 10,
	// 	sublistMaxPv: 250,
	// 	sublistScenarios: ["Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"]
	// },
	{
		name: "wn350v3",
		display: "Wolfnet 350 v3.0",
		shortDisplay: "WN350v3",
		singleEraFaction: true,
		eraFactionRestriction: true,
		maxPv: 350,
		maxUnits: 16,
		allowedTypes: ["BA", "BM", "CV", "CI", "IM", "PM", "BS"],
		allowedRules: ["Introductory", "Advanced", "Standard"],
		disallowedAbilities: ["DRO"],
		customUnitPacks: ["wn350v3"],
		maxSkill: 6,
		minSkill: 2,
		unitLimits: [
			{ types: ["BM", "IM"], max: 12 },
			{ types: ["CV"], max: 6 },
			{ types: ["BA", "CI"], max: 5 },
			{ types: ["PM"], equal: [0, 5] }
		],
		chassisLimits: [{ types: ["All"], max: 2 }],
		variantLimits: [
			{ types: ["BM", "IM"], max: 1 },
			{ types: ["CV"], max: 1, exceptions: { ability: [{ name: "IT", min: 3, max: 2 }] } }
		],
		skillLimits: [{ types: ["2", "6"], max: 2 }],
		requireHitch: true,
		abilityLimits: [{ types: ["JMPS"], max: 2 }],
		unitMinPV: 7,
		uniqueMaxLimit: 1,
		sublistMaxUnits: 10,
		sublistMaxPv: 250,
		sublistScenarios: [
			"Bunkers",
			"Capture the Flag",
			"Domination",
			"Headhunter",
			"Hold the Line",
			"King of the Hill",
			"Overrun",
			"Stand Up Fight",
			"Pressure Plate",
			"Stranglehold"
		]
	},
	{
		name: "wn350v3d",
		display: "Wolfnet 350 v3.0 Doubles",
		shortDisplay: "WN350v3 Dbls",
		singleEraFaction: true,
		eraFactionRestriction: true,
		maxPv: 250,
		maxUnits: 10,
		allowedTypes: ["BA", "BM", "CV", "CI", "IM", "PM", "BS"],
		allowedRules: ["Introductory", "Advanced", "Standard"],
		disallowedAbilities: ["DRO"],
		customUnitPacks: ["wn350v3"],
		maxSkill: 6,
		minSkill: 2,
		unitLimits: [
			{ types: ["BM", "IM"], max: 12 },
			{ types: ["CV"], max: 6 },
			{ types: ["BA", "CI"], max: 5 },
			{ types: ["PM"], equal: [0, 5] }
		],
		chassisLimits: [{ types: ["All"], max: 2 }],
		variantLimits: [
			{ types: ["BM", "IM"], max: 1 },
			{ types: ["CV"], max: 1, exceptions: { ability: [{ name: "IT", min: 3, max: 2 }] } }
		],
		skillLimits: [{ types: ["2", "6"], max: 2 }],
		requireHitch: true,
		abilityLimits: [{ types: ["JMPS"], max: 2 }],
		unitMinPV: 7,
		uniqueMaxLimit: 1,
		sublistMaxUnits: 10,
		sublistMaxPv: 250,
		sublistScenarios: [
			"Bunkers",
			"Capture the Flag",
			"Domination",
			"Headhunter",
			"Hold the Line",
			"King of the Hill",
			"Overrun",
			"Stand Up Fight",
			"Pressure Plate",
			"Stranglehold"
		]
	},
	{
		name: "wn350v3e",
		display: "Wolfnet 350 v3.0 Epic",
		shortDisplay: "WN350v3 Epic",
		singleEraFaction: true,
		eraFactionRestriction: true,
		maxPv: 600,
		maxUnits: 18,
		allowedTypes: ["BA", "BM", "CV", "CI", "IM", "PM", "BS"],
		allowedRules: ["Introductory", "Advanced", "Standard"],
		disallowedAbilities: ["DRO"],
		customUnitPacks: ["wn350v3"],
		maxSkill: 6,
		minSkill: 1,
		unitLimits: [
			{ types: ["CV"], max: 8 },
			{ types: ["BA", "CI"], max: 6 },
			{ types: ["PM"], equal: [0, 5] }
		],
		chassisLimits: [{ types: ["All"], max: 2 }],
		variantLimits: [
			{ types: ["BM", "IM"], max: 1 },
			{ types: ["CV"], max: 1, exceptions: { ability: [{ name: "IT", min: 3, max: 2 }] } }
		],
		skillLimits: [
			{ types: ["2", "6"], max: 2 },
			{ types: ["1"], max: 1 }
		],
		requireHitch: true,
		abilityLimits: [{ types: ["JMPS"], max: 2 }],
		unitMinPV: 7,
		uniqueMaxLimit: 1,
		sublistMaxUnits: 10,
		sublistMaxPv: 250,
		sublistScenarios: [
			"Bunkers",
			"Capture the Flag",
			"Domination",
			"Headhunter",
			"Hold the Line",
			"King of the Hill",
			"Overrun",
			"Stand Up Fight",
			"Pressure Plate",
			"Stranglehold"
		]
	},
	{
		name: "asopen",
		display: "Alpha Strike Open",
		shortDisplay: "ASOpen",
		singleEraFaction: true,
		eraFactionRestriction: true,
		maxPv: 400,
		maxUnits: 16,
		allowedTypes: ["BA", "BM", "CV", "CI", "IM", "PM"],
		disallowedAbilities: ["DRO", "BIM", "DCC", "HPG", "LAM", "RBT"],
		maxSkill: 6,
		minSkill: 2,
		unitPvLimits: [{ types: ["BM", "IM"], min: "50%" }],
		chassisLimits: [{ types: ["All"], max: 2 }],
		variantLimits: [{ types: ["BM", "IM"], max: 1 }],
		skillLimits: [{ types: ["6"], max: 2 }],
		requireHitch: true,
		abilityLimits: [
			{ types: ["JMPS"], max: 2 },
			{ types: ["ART"], max: 2, requirements: { skill: { min: 4 } } }
		],
		uniqueMaxLimit: 1
	}
];

export function getRulesByName(name: string) {
	return ruleSets.find((rules) => rules.name == name);
}
