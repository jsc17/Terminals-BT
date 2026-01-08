import { query, command, getRequestEvent, form } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import type { MatchUnit, MatchCrit } from "$lib/generated/prisma/browser";

export const getMatchDetails = query(v.string(), async (matchId) => {
	const match = await prisma.match.findUnique({ where: { id: matchId } });
	return match != null ? match : undefined;
});

export const getMyData = query(v.string(), async (matchId) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return undefined;
	const userData = await prisma.usersInMatch.findFirst({ where: { playerId: locals.user?.id, matchId: matchId } });

	if (userData == null) return undefined;
	return userData;
});

export const getPlayerData = query(v.object({ playerId: v.number() }), async ({ playerId }) => {
	const results = await prisma.usersInMatch.findUnique({
		where: { id: playerId },
		include: { lists: { include: { formations: { include: { units: { include: { criticals: true } } } } } } }
	});
	return results != null ? results : undefined;
});

export const getAllPlayerData = query(v.string(), async (matchId) => {
	const results = await prisma.usersInMatch.findMany({
		where: { matchId },
		include: { lists: { include: { formations: { include: { units: { include: { criticals: true } } } }, player: { select: { id: true, playerNickname: true } } } } }
	});
	return results != null ? results : [];
});

export const getTeamData = query(v.string(), async (matchId) => {
	const results = await prisma.matchTeam.findMany({ where: { matchId } });
	return results != null ? results : [];
});

export const getMatchList = query(v.number(), async (listId) => {
	const list = await prisma.matchList.findUnique({
		where: { id: listId },
		include: { formations: { include: { units: { include: { criticals: true } } } }, player: { select: { id: true, playerNickname: true } } }
	});
	return list;
});

export const getMatchUnitData = query.batch(v.number(), async (data) => {
	const lookup = new Map<number, ({ criticals: MatchCrit[] } & MatchUnit) | undefined>();

	await Promise.all(
		data.map(async (id) => {
			const unit = await prisma.matchUnit.findUnique({ where: { id }, include: { criticals: true } });
			lookup.set(id, unit ?? undefined);
		})
	);

	return (id) => lookup.get(id);
});

export const deleteMatch = command(v.string(), async (matchId) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };
	console.log("match deleted");
	const matchData = await prisma.match.findUnique({ where: { id: matchId }, include: { players: { where: { playerRole: "HOST" } } } });
	if (matchData != null && matchData.players[0].playerId == locals.user.id) {
		await prisma.match.delete({ where: { id: matchId } });
	}
});

export const getLogs = query(v.object({ matchId: v.string(), lastLogId: v.number() }), async ({ matchId, lastLogId }) => {
	const logs = await prisma.matchLog.findMany({ where: { matchId: matchId, id: { gt: lastLogId } } });
	return logs;
});
