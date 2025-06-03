type Limit = {
	types: string[];
	min?: number;
	max?: number;
	equal?: number[];
	exceptions?: { ability: { name: string; minValue: number; max: number }[] };
};

export type Options = {
	name: string;
	display: string;
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
	chassisLimits?: Limit[];
	variantLimits?: Limit[];
	skillLimits?: Limit[];
	requireHitch?: boolean;
	abilityLimits?: Limit[];
	uniqueMaxLimit?: number;
	unitMinPV?: number;
	sublistMaxUnits?: number;
	sublistMaxPv?: number;
	sublistScenarios: string[];
};

export const ruleSets: Options[] = [
	{
		name: "noRes",
		display: "No Restrictions",
		sublistScenarios: []
	},
	{
		name: "wn350",
		display: "Wolfnet 350 v2.3",
		eraFactionRestriction: true,
		maxPv: 350,
		maxUnits: 16,
		allowedTypes: ["BA", "BM", "CV", "CI", "IM", "PM", "BS"],
		allowedRules: ["Introductory", "Advanced", "Standard"],
		disallowUnique: true,
		disallowedAbilities: ["DRO"],
		customUnitPacks: ["wn350"],
		maxSkill: 6,
		minSkill: 2,
		unitLimits: [
			{ types: ["BM", "IM"], max: 12 },
			{ types: ["CV"], max: 8 },
			{ types: ["BA", "CI"], max: 5 },
			{ types: ["PM"], equal: [0, 5] }
		],
		chassisLimits: [{ types: ["All"], max: 2 }],
		variantLimits: [{ types: ["BM", "IM"], max: 1 }],
		skillLimits: [{ types: ["2", "6"], max: 2 }],
		requireHitch: true,
		abilityLimits: [{ types: ["JMPS"], max: 2 }],
		sublistMaxUnits: 10,
		sublistMaxPv: 250,
		sublistScenarios: ["Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"]
	},
	{
		name: "wn350v3",
		display: "Wolfnet 350 v3.0",
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
			{ types: ["CV"], max: 1, exceptions: { ability: [{ name: "IT", minValue: 3, max: 2 }] } }
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
	}
];

export function getRules(name: string) {
	return ruleSets.find((rules) => rules.name == name);
}
