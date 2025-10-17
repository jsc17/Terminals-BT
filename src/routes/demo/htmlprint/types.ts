import type { MulUnit } from "$lib/types/listTypes";
import * as v from "valibot";

export const PrintOptionsSchema = v.object({
	printStyle: v.picklist(["simple", "detailed"]),
	printFormations: v.boolean(),
	printCardsByFormation: v.boolean(),
	printFormationBonuses: v.boolean(),
	cardStyle: v.picklist(["mul", "generated"]),
	formationHeaderStyle: v.picklist(["inline", "side"]),
	measurementUnits: v.picklist(["inches", "hexes"]),
	printReferences: v.boolean()
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
