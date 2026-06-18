import * as v from "valibot";

export const TournamentCreationSchema = v.object({
	tournamentName: v.string(),
	tournamentDate: v.string(),
	tournamentEmail: v.string(),
	tournamentEra: v.optional(v.string()),
	tournamentRules: v.string(),
	tournamentEmailSubject: v.optional(v.string()),
	tournamentLocation: v.optional(v.string()),
	tournamentMessage: v.string(),
	teams: v.optional(v.boolean(), false)
});
