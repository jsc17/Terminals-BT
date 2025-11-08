import * as v from "valibot";

export const PlaymodeOptionsSchema = v.object({
	cardsPerRow: v.fallback(v.number(), 3),
	uiScale: v.fallback(v.number(), 50),
	renderOriginal: v.fallback(v.boolean(), true),
	showPhysical: v.fallback(v.boolean(), false),
	showCrippled: v.fallback(v.boolean(), true),
	showJumpTMM: v.fallback(v.boolean(), true),
	confirmEnd: v.fallback(v.boolean(), true),
	groupByFormation: v.fallback(v.boolean(), true),
	damageDirection: v.fallback(v.picklist(["left", "right"]), "left"),
	measurementUnits: v.fallback(v.picklist(["inches", "hexes"]), "inches"),
	duplicateUnitMarkings: v.fallback(v.picklist(["numbers", "letters", "roman"]), "numbers")
});

export type PlaymodeOptionsOutput = v.InferOutput<typeof PlaymodeOptionsSchema>;
