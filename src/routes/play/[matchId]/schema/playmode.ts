import * as z from "zod";

const PlaymodeOptionsSchema = z.object({
	cardsPerRow: z.number().catch(3),
	uiScale: z.number().catch(50),
	renderOriginal: z.boolean().catch(true),
	showPhysical: z.boolean().catch(false),
	showCrippled: z.boolean().catch(true),
	showJumpTMM: z.boolean().catch(true),
	confirmEnd: z.boolean().catch(true),
	groupByFormation: z.boolean().catch(true),
	damageDirection: z.literal(["left", "right"]).catch("left"),
	measurementUnits: z.literal(["inches", "hexes"]).catch("inches"),
	duplicateUnitMarkings: z.literal(["numbers", "letters", "roman"]).catch("numbers")
});

export { PlaymodeOptionsSchema };
