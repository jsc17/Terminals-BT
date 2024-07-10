type Limit = {
	types: string[];
	min?: number;
	max?: number;
	equal?: number[];
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
};

export const ruleSets: Options[] = [
	{
		name: "noRes",
		display: "No Restrictions"
	},
	{
		name: "wn350",
		display: "Wolfnet 350",
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
		abilityLimits: [{ types: ["jmps"], max: 2 }]
	}
];

export function getRules(name: string) {
	return ruleSets.find((rules) => rules.name == name);
}
