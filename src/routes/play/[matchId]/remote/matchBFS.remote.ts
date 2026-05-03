import { command, getRequestEvent } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";

export const useBFS = command(v.number(), async (bfsId) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const bfsData = await prisma.matchBFS.findUnique({ where: { id: bfsId }, include: { list: { select: { matchId: true } } } });

	if (bfsData) {
		if (bfsData.used < bfsData.count) await prisma.matchBFS.update({ where: { id: bfsId }, data: { used: { increment: 1 } } });
		else return { status: "failure", message: "BFS Used more times than it was taken" };

		const matchData = await prisma.match.findUnique({ where: { id: bfsData?.list.matchId }, include: { players: true } });
		const submitter = matchData?.players.find((p) => p.playerId == locals.user!.id);
		await prisma.matchLog.create({
			data: {
				type: "BFS_USED",
				round: matchData?.currentRound ?? 0,
				match: { connect: { id: matchData?.id } },
				submitter: { connect: { id: submitter?.id } },
				details: bfsId
			}
		});
	} else {
		return { status: "failure", message: `BFS Data not found for Id: ${bfsId}` };
	}
});

export const undoBFS = command(v.number(), async (bfsId) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const bfsData = await prisma.matchBFS.findUnique({ where: { id: bfsId }, include: { list: { select: { matchId: true } } } });

	if (bfsData) {
		if (bfsData.used > 0) await prisma.matchBFS.update({ where: { id: bfsId }, data: { used: { decrement: 1 } } });
		else return { status: "failure", message: "BFS times used already at 0" };

		const matchData = await prisma.match.findUnique({ where: { id: bfsData?.list.matchId }, include: { players: true } });
		const submitter = matchData?.players.find((p) => p.playerId == locals.user!.id);
		await prisma.matchLog.create({
			data: {
				type: "BFS_RESTORED",
				round: matchData?.currentRound ?? 0,
				match: { connect: { id: matchData?.id } },
				submitter: { connect: { id: submitter?.id } },
				details: bfsId
			}
		});
	} else {
		return { status: "failure", message: `BFS Data not found for Id: ${bfsId}` };
	}
});
