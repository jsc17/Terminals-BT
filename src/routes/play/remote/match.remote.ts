import { query, command, getRequestEvent } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";

export const getRole = query(v.number(), async (matchId) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return undefined;
	const role = await prisma.usersInMatch.findFirst({ where: { playerId: locals.user?.id, matchId: matchId }, select: { playerRole: true } });

	if (role == null) return undefined;
	return role.playerRole;
});

export const getPlayerList = query(v.number(), async (matchId) => {
	const results = await prisma.usersInMatch.findMany({ where: { matchId } });
	return results != null ? results : [];
});

export const getTeamList = query(v.number(), async (matchId) => {
	const results = await prisma.matchTeam.findMany({ where: { matchId } });
	return results != null ? results : [];
});
