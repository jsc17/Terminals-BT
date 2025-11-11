import * as v from "valibot";

export const CreateMatchSchema = v.object({
	private: v.optional(v.boolean(), false),
	joinCode: v.pipe(v.string(), v.minLength(3, "The match join code must be at least 3 characters")),
	name: v.pipe(v.string(), v.minLength(3, "The match name must be at least 3 characters")),
	hostNickname: v.pipe(v.string(), v.nonEmpty("Your nickname must include at least one character")),
	teamNames: v.optional(v.array(v.string()), ["Red", "Blue"])
});

export const NicknameSchema = v.object({ nickname: v.pipe(v.string(), v.minLength(3)) });
