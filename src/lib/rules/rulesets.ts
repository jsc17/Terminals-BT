type Limit = {
	types: string[];
	min?: number | `${number}%`;
	max?: number | `${number}%`;
	equal?: number[];
	exceptions?: { ability: { name: string; min: number; max: number }[] };
	requirements?: { skill?: { min?: number; max?: number }; pv?: { min?: number; max?: number } };
};

type TypeWithRequirement = {
	value: string;
	abilityRequirement?: {
		ability: string[];
		minValue?: number;
	};
};

export type Ruleset = {
	archived?: boolean;
	name: string;
	display: string;
	notice?: string;
	shortDisplay: string;
	singleEraFaction?: boolean;
	eraFactionRestriction?: boolean;
	maxPv?: number;
	maxUnits?: number;
	allowedTypes?: TypeWithRequirement[];
	allowedRules?: TypeWithRequirement[];
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
	bfs?: {
		allowedPacks?: string[];
		maxPv?: number;
		maxBSP?: number;
		maxCount?: number;
		maxCountPerType?: number;
	};
	allowFormations: boolean;
	allowSCA: boolean;
};

export const ruleSets: Ruleset[] = [
	{
		name: "noRes",
		display: "No Restrictions",
		shortDisplay: "-",
		eraFactionRestriction: true,
		sublistScenarios: [],
		bfs: {
			allowedPacks: ["core"]
		},
		allowFormations: true,
		allowSCA: true
	},
	{
		archived: true,
		name: "wn350",
		display: "Wolfnet 350 v2.3",
		shortDisplay: "WN350v2.3",
		notice: "Off-Board Artillery supports have been moved from units to the Battlefield Support tab",
		singleEraFaction: true,
		eraFactionRestriction: true,
		maxPv: 350,
		maxUnits: 16,
		allowedTypes: [{ value: "BA" }, { value: "BM" }, { value: "CV" }, { value: "CI" }, { value: "IM" }, { value: "PM" }],
		allowedRules: [{ value: "Introductory" }, { value: "Advanced" }, { value: "Standard" }],
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
		sublistScenarios: ["Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"],
		bfs: { allowedPacks: ["wn350"], maxCountPerType: 2 },
		allowFormations: false,
		allowSCA: false
	},
	{
		name: "wn350v3",
		display: "Wolfnet 350 v3.2",
		shortDisplay: "WN350v3.2",
		singleEraFaction: true,
		eraFactionRestriction: true,
		maxPv: 350,
		maxUnits: 16,
		allowedTypes: [{ value: "BA" }, { value: "BM" }, { value: "CV" }, { value: "CI" }, { value: "IM" }, { value: "PM" }],
		allowedRules: [{ value: "Introductory" }, { value: "Advanced" }, { value: "Standard" }],
		disallowedAbilities: ["DRO"],
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
			"Escalation",
			"Stranglehold",
			"Resource Recovery",
			"Hot Drop"
		],
		bfs: { allowedPacks: ["wn350v3"], maxCountPerType: 2 },
		allowFormations: false,
		allowSCA: false
	},
	{
		name: "wn350v3d",
		display: "Wolfnet 350 v3.2 Doubles",
		shortDisplay: "WN350v3.2 Dbls",
		singleEraFaction: true,
		eraFactionRestriction: true,
		maxPv: 250,
		maxUnits: 10,
		allowedTypes: [{ value: "BA" }, { value: "BM" }, { value: "CV" }, { value: "CI" }, { value: "IM" }, { value: "PM" }],
		allowedRules: [{ value: "Introductory" }, { value: "Advanced" }, { value: "Standard" }],
		disallowedAbilities: ["DRO"],
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
		sublistScenarios: [],
		bfs: { allowedPacks: ["wn350v3"], maxCountPerType: 2 },
		allowFormations: true,
		allowSCA: false
	},
	{
		name: "wn350v3e",
		display: "Wolfnet 350 v3.2 Epic",
		shortDisplay: "WN350v3.2 Epic",
		singleEraFaction: true,
		eraFactionRestriction: true,
		maxPv: 600,
		maxUnits: 18,
		allowedTypes: [{ value: "BA" }, { value: "BM" }, { value: "CV" }, { value: "CI" }, { value: "IM" }, { value: "PM" }],
		allowedRules: [{ value: "Introductory" }, { value: "Advanced" }, { value: "Standard" }],
		disallowedAbilities: ["DRO"],
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
		sublistScenarios: [],
		bfs: { allowedPacks: ["wn350v3"], maxCountPerType: 2 },
		allowFormations: true,
		allowSCA: false
	},
	{
		name: "ksagg7",
		display: "KSAGG 7 Singles",
		shortDisplay: "WN350v3.2",
		singleEraFaction: true,
		eraFactionRestriction: true,
		maxPv: 350,
		maxUnits: 16,
		allowedTypes: [{ value: "BA" }, { value: "BM" }, { value: "CV" }, { value: "CI" }, { value: "IM" }, { value: "PM" }],
		allowedRules: [{ value: "Introductory" }, { value: "Advanced" }, { value: "Standard" }, { value: "Experimental", abilityRequirement: { ability: ["LAM", "BIM"] } }],
		disallowedAbilities: ["DRO"],
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
		abilityLimits: [
			{ types: ["JMPS"], max: 2 },
			{ types: ["LAM", "BIM"], max: 1 }
		],
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
			"Escalation",
			"Stranglehold",
			"Resource Recovery",
			"Hot Drop"
		],
		bfs: { allowedPacks: ["wn350v3"], maxCountPerType: 2 },
		allowFormations: false,
		allowSCA: false
	},
	{
		name: "ksagg7d",
		display: "KSAGG 7 Doubles",
		shortDisplay: "WN350v3.2 Dbls",
		singleEraFaction: true,
		eraFactionRestriction: true,
		maxPv: 250,
		maxUnits: 10,
		allowedTypes: [{ value: "BA" }, { value: "BM" }, { value: "CV" }, { value: "CI" }, { value: "IM" }, { value: "PM" }],
		allowedRules: [{ value: "Introductory" }, { value: "Advanced" }, { value: "Standard" }, { value: "Experimental", abilityRequirement: { ability: ["LAM", "BIM"] } }],
		disallowedAbilities: ["DRO"],
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
		abilityLimits: [
			{ types: ["JMPS"], max: 2 },
			{ types: ["LAM", "BIM"], max: 1 }
		],
		unitMinPV: 7,
		uniqueMaxLimit: 1,
		sublistMaxUnits: 10,
		sublistMaxPv: 250,
		sublistScenarios: [],
		bfs: { allowedPacks: ["wn350v3"], maxCountPerType: 2 },
		allowFormations: true,
		allowSCA: false
	},
	{
		name: "asopen",
		display: "Alpha Strike Open",
		shortDisplay: "ASOpen",
		singleEraFaction: true,
		eraFactionRestriction: true,
		maxPv: 400,
		maxUnits: 16,
		allowedTypes: [{ value: "BA" }, { value: "BM" }, { value: "CV" }, { value: "CI" }, { value: "IM" }, { value: "PM" }],
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
		uniqueMaxLimit: 1,
		allowFormations: false,
		allowSCA: false
	},
	{
		name: "sa2026",
		display: "Southern Assault 2026",
		shortDisplay: "SA2026",
		singleEraFaction: true,
		eraFactionRestriction: true,
		maxPv: 375,
		maxUnits: 16,
		uniqueMaxLimit: 1,
		allowedTypes: [{ value: "BA" }, { value: "BM" }, { value: "CV" }, { value: "CI" }, { value: "IM" }, { value: "PM" }],
		allowFormations: false,
		allowSCA: false,
		allowedRules: [{ value: "Introductory" }, { value: "Advanced" }, { value: "Standard" }],
		disallowedAbilities: ["DRO", "BIM", "DCC", "HPG", "LAM", "RBT"],
		unitLimits: [
			{ types: ["BM", "IM"], max: 15 },
			{ types: ["CV"], max: 12 },
			{ types: ["BA", "CI"], max: 5 },
			{ types: ["PM"], max: 5 }
		],
		chassisLimits: [{ types: ["BM", "IM", "CV"], max: 2 }],
		variantLimits: [{ types: ["BM", "IM"], max: 1 }],
		skillLimits: [
			{ types: ["2"], max: 2 },
			{ types: ["6"], max: 2 }
		],
		abilityLimits: [
			{ types: ["JMPS"], max: 2 },
			{ types: ["ART"], max: 2, requirements: { skill: { min: 3 } } },
			{ types: ["HT"], max: 5 }
		]
	}
];

export function getRulesByName(name: string) {
	return ruleSets.find((rules) => rules.name == name);
}
