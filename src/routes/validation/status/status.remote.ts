import { form, getRequestEvent, query } from "$app/server";
import { prisma } from "$lib/server/prisma";
import * as v from "valibot";

export const getUserSubmissions = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals) return { status: "failed", message: "User not logged in" };

	const results = await prisma.user.findUnique({
		where: { id: locals.user?.id },
		include: { submissions: { include: { tournament: { select: { name: true, tournament_date: true, tournamentRules: true } } } } }
	});
	return { status: "success", data: results?.submissions ?? [] };
});

export const getSubmissionsByEmail = form(v.object({ email: v.string() }), async ({ email }) => {
	const results = await prisma.participant.findMany({
		where: { email },
		select: { dateSubmitted: true, teamName: true, approved: true, tournament: { select: { name: true, tournament_date: true, tournamentRules: true } } }
	});
	return { status: "success", data: results };
});
