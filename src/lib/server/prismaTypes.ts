import * as v from "valibot";

export const roundSummaryUnitUpdateSchema = v.object({
	destroyed: v.optional(v.boolean()),
	damage: v.optional(v.number()),
	heat: v.optional(v.number()),
	criticals: v.optional(v.array(v.string()))
});

declare global {
	namespace PrismaJson {
		type roundSummaryUnitUpdate = v.InferOutput<typeof roundSummaryUnitUpdateSchema>;
	}
}
