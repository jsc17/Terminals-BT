export type ValidationList = {
	[key: string]: any;
	pv: [boolean, number];
	unitsUnavailable: [boolean, string[]];
	unitNumber: [boolean, number];
	mechNumber: [boolean, number];
	cvNumber: [boolean, number];
	infNumber: [boolean, number];
	proto: [boolean, number];
	unallowedType: [boolean, string[]];
	skillThreshold: [boolean, string[]];
	skillCombo: [boolean, string[], number];
	chassis: [boolean, string[]];
	variant: [boolean, string[]];
	jmps: [boolean, string[], number];
	dro: [boolean, string[]];
	experimental: [boolean, string[]];
	unknown: [boolean, string[]];
	unique: [boolean, string[]];
	trailer: [boolean, string[], string[]];
};

export const Errors: { [key: string]: string } = {
	pv: "List may have a maximum of 350 total PV",
	unitNumber: "Total Units must be equal to or less than 16",
	mechNumber: "Total number of mechs(BM and IM) must be equal to or less than 12",
	cvNumber: "Total number of combat vehicles must be equal to or less than 8",
	infNumber: "Total number of infantry (including BA) must be equal to or less than 5",
	proto: "Total number of Protomechs must be equal to 0 or 5",
	skillCombo: "May only have two units at the extremes of the skill range (2 and 6)",
	chassis: "You may have a maximum of 2 units with the same chassis",
	variant: "Each Mech must be a unique variant",
	jmps: "Combined total of JMPS must be equal to or less than 2",
	trailer: "Each trailered unit must have a hitch unit"
};

export const unitTypes = [
	"BattleMech",
	"Combat Vehicle",
	"Aerospace",
	"Infantry",
	"IndustrialMech",
	"Protomech",
	"Support Vehicle",
	"Advanced Aerospace",
	"Advanced Support",
	"Building",
	"Unknown"
];
