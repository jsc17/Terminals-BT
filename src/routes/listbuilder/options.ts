export interface Options {
	name: string;
	display: string;
	maxPv?: number;
	maxUnits?: number;
	allowedTypes?: string[];
	allowedRules?: string[];
	disallowUnique?: boolean;
	disallowedAbilities?: string[];
}

export const ruleSets: Options[] = [
	{
		name: "noRes",
		display: "No Restrictions"
	},
	{
		name: "wn350",
		display: "Wolfnet 350",
		maxPv: 350,
		maxUnits: 16,
		allowedTypes: ["BA", "BM", "CV", "CI", "IM", "IM", "PM"],
		allowedRules: ["Introductory", "Advanced", "Standard"],
		disallowUnique: true,
		disallowedAbilities: ["DRO"]
	}
];
