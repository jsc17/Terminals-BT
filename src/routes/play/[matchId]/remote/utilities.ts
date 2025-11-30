import { prisma } from "$lib/server/prisma";

export async function getSubmitter(matchId: number, playerId: string) {
	const submitter = await prisma.usersInMatch.findUnique({ where: { match_player: { matchId, playerId } } });
	return submitter;
}
