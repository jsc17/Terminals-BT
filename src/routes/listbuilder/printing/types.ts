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
	bs: v.optional(v.array(v.number()))
});

export type PrintListOutput = v.InferOutput<typeof PrintListSchema>;
