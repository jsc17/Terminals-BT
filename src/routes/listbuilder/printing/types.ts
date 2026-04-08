import type { ListUnit } from "$lib/types/listTypes";
import * as v from "valibot";

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
			units: v.array(v.string()),
			secondary: v.optional(v.object({ type: v.string(), units: v.array(v.string()) }))
		})
	),
	scas: v.optional(v.array(v.number())),
	bs: v.optional(v.map(v.number(), v.number()))
});

export type PrintListOutput = v.InferOutput<typeof PrintListSchema>;

export type PrintableSublist = {
	scenario: string;
	pv: number;
	unitList: ListUnit[];
	bfs: [number, number][];
};

export const PrintSublistsSchema = v.object({
	name: v.optional(v.string(), "Sublist"),
	sublists: v.string(),
	layout: v.optional(v.picklist(["vertical", "horizontal"]), "vertical"),
	grouped: v.optional(v.boolean(), false)
});

export type PrintSublistsOutput = v.InferOutput<typeof PrintSublistsSchema>;
