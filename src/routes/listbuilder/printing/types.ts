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

export const PrintListSchema = v.object({
	name: v.string(),
	units: v.array(
		v.object({
			id: v.string(),
			mulId: v.number(),
			skill: v.number(),
			customization: v.optional(v.object({ spa: v.optional(v.array(v.string())), ammo: v.optional(v.array(v.string())) }))
		})
	),
	formations: v.array(
		v.object({
			name: v.string(),
			type: v.string(),
			units: v.array(v.string())
		})
	),
	scas: v.optional(v.array(v.number())),
	bs: v.optional(v.array(v.number()))
});

export type PrintListOutput = v.InferOutput<typeof PrintListSchema>;
