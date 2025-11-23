import * as v from "valibot";

export const SubmitListSchema = v.object({
	tournamentId: v.string(),
	playerName: v.string(),
	playerEmail: v.string(),
	listFile: v.file(),
	eraId: v.string(),
	factionId: v.string(),
	fixedData: v.string(),
	unit: v.array(v.string())
});
