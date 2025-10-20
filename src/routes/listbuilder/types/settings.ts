import * as v from "valibot";

export const PrintOptionsSchema = v.object({
	printStyle: v.fallback(v.picklist(["simple", "detailed"]), "detailed"),
	printFormations: v.fallback(v.boolean(), true),
	printCardsByFormation: v.fallback(v.boolean(), true),
	printFormationBonuses: v.fallback(v.boolean(), true),
	cardStyle: v.fallback(v.picklist(["mul", "generated"]), "generated"),
	formationHeaderStyle: v.fallback(v.picklist(["inline", "side"]), "inline"),
	measurementUnits: v.fallback(v.picklist(["inches", "hexes"]), "inches"),
	printReferences: v.fallback(v.boolean(), true)
});

export type PrintOptionsOutput = v.InferOutput<typeof PrintOptionsSchema>;

export const SublistOptionsSchema = v.object({
	sublistOrientation: v.fallback(v.picklist(["vertical", "horizontal"]), "vertical"),
	sublistSortOrder: v.fallback(v.picklist(["pv", "name"]), "pv"),
	sublistPrintListSettings: PrintOptionsSchema,
	sublistPrintAllOrientation: v.fallback(v.picklist(["vertical", "horizontal", "card"]), "vertical"),
	sublistPrintAllGroupByScenario: v.fallback(v.boolean(), false)
});

export type SublistOptionsOutput = v.InferOutput<typeof SublistOptionsSchema>;

export const SettingsSchema = v.object({
	print: PrintOptionsSchema,
	sublistUI: SublistOptionsSchema
});

export type SettingsOutput = v.InferOutput<typeof SettingsSchema>;
