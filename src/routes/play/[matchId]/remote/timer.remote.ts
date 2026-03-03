import * as v from "valibot";
import { command, getRequestEvent } from "$app/server";
import { prisma } from "$lib/server/prisma";
import { getSubmitter } from "./utilities";

export const pauseTimer = command(v.string(), async (matchId) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };
	const submitter = await getSubmitter(matchId, locals.user.id);
	if (submitter?.playerRole != "HOST" && submitter?.playerRole != "MODERATOR") return { status: "failure", message: "User does not have permission to pause this game" };

	const match = await prisma.match.update({
		where: { id: matchId },
		data: { timePaused: new Date() }
	});
	await prisma.matchLog.create({
		data: {
			type: "MATCH_PAUSED",
			round: match.currentRound,
			match: { connect: { id: matchId } },
			submitter: { connect: { id: submitter.id } }
		}
	});
});

export const resumeTimer = command(v.string(), async (matchId) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };
	const submitter = await getSubmitter(matchId, locals.user.id);
	if (submitter?.playerRole != "HOST" && submitter?.playerRole != "MODERATOR") return { status: "failure", message: "User does not have permission to resume this game" };

	const match = await prisma.match.findUnique({ where: { id: matchId } });
	if (match == null) return { status: "failure", message: "Match not found" };

	const timePausedDurationMs = match.timePaused ? new Date().getTime() - match.timePaused.getTime() : 0;

	await prisma.match.update({
		where: { id: matchId },
		data: { timePaused: null, timePausedDurationMs: match.timePausedDurationMs + timePausedDurationMs }
	});

	await prisma.matchLog.create({
		data: {
			type: "MATCH_RESUMED",
			round: match.currentRound,
			match: { connect: { id: matchId } },
			submitter: { connect: { id: submitter.id } }
		}
	});
});
