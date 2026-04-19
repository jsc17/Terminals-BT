import * as v from "valibot";

export const SubmitListSchema = v.object({
	tournamentId: v.string(),
	playerName: v.string(),
	playerEmail: v.string(),
	listFile: v.file(),
	eraId: v.string(),
	factionId: v.string(),
	unit: v.optional(v.array(v.string()), []),
	addedUnits: v.optional(v.array(v.string()), []),
	fixedUnits: v.optional(v.array(v.string()), []),
	bfs: v.optional(v.array(v.string()), []),
	addedBfs: v.optional(v.array(v.string()), []),
	fixedBfs: v.optional(v.array(v.string()), [])
});
