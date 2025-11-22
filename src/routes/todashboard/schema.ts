import * as v from "valibot";

export const FormCreationSchema = v.object({
	tournamentName: v.string(),
	tournamentDate: v.string(),
	tournamentEmail: v.string(),
	tournamentEra: v.optional(v.string()),
	tournamentRules: v.string(),
	tournamentEmailSubject: v.optional(v.string()),
	tournamentLocation: v.optional(v.string()),
	tournamentMessage: v.string()
});
