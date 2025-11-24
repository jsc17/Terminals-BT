import { query, command, getRequestEvent, form } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import { clients } from "$lib/server/sseClients";
import type { MatchUnit, MatchCrit } from "$lib/generated/prisma/browser";

export const getMatchDetails = query(v.number(), async (matchId) => {
	const match = await prisma.match.findUnique({ where: { id: matchId } });
	return match != null ? match : undefined;
});

export const getMyData = query(v.number(), async (matchId) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return undefined;
	const userData = await prisma.usersInMatch.findFirst({ where: { playerId: locals.user?.id, matchId: matchId } });

	if (userData == null) return undefined;
	return userData;
});

export const getPlayerData = query(v.object({ playerId: v.string(), matchId: v.number() }), async ({ playerId, matchId }) => {
	const results = await prisma.usersInMatch.findUnique({
		where: { matchId_playerId: { playerId, matchId } },
		include: { formations: { include: { units: { include: { criticals: true } } } } }
	});
	return results != null ? results : undefined;
});

export const getAllPlayerData = query(v.number(), async (matchId) => {
	const results = await prisma.usersInMatch.findMany({ where: { matchId }, include: { formations: { include: { units: { include: { criticals: true } } } } } });
	return results != null ? results : [];
});

export const getTeamData = query(v.number(), async (matchId) => {
	const results = await prisma.matchTeam.findMany({ where: { matchId } });
	return results != null ? results : [];
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

export const joinMatch = form(
	v.object({
		teamId: v.pipe(
			v.string(),
			v.transform((input) => Number(input))
		),
		matchId: v.pipe(
			v.string(),
			v.transform((input) => Number(input))
		),
		joinCode: v.optional(v.string()),
		listId: v.optional(v.string()),
		listCode: v.optional(v.string()),
		nickname: v.string()
	}),
	async (data, invalid) => {
		const { locals } = getRequestEvent();
		if (!locals.user) return undefined;

		const match = await prisma.match.findUnique({ where: { id: data.matchId }, include: { players: true } });
		const host = match?.players.find((p) => p.playerRole == "HOST");

		if (host?.playerId == locals.user.id) {
			await prisma.usersInMatch.update({
				where: { matchId_playerId: { playerId: locals.user.id, matchId: data.matchId } },
				data: { playerNickname: data.nickname, team: { connect: { id: data.teamId } } }
			});
		} else {
			if (!data.joinCode || data.joinCode != match?.joinCode) throw invalid(invalid.joinCode("Invalid join code for this match"));
			if (!data.nickname) throw invalid("Player nickname is required");
			await prisma.match.update({
				where: { id: data.matchId },
				data: {
					players: { create: [{ player: { connect: { id: locals.user.id } }, playerNickname: data.nickname, playerRole: "PLAYER", team: { connect: { id: data.teamId } } }] }
				}
			});
		}

		const list = await prisma.listV3.findUnique({ where: { userId: locals.user.id, id: data.listId }, select: { units: true, formations: true } });
		if (list == null) throw invalid(invalid.listId("List could not be loaded. Please try again"));

		const units = JSON.parse(list.units);
		for (const formation of JSON.parse(list.formations)) {
			if (formation.units.length == 0) continue;
			await prisma.usersInMatch.update({
				where: { matchId_playerId: { playerId: locals.user.id, matchId: data.matchId } },
				data: {
					formations: {
						create: [
							{
								name: formation.name,
								type: formation.type,
								units: {
									create: formation.units.map((f: { id: string }) => {
										const unit = units.find((u: { id: string }) => u.id == f.id);
										return { mulId: unit.mulId, skill: unit.skill ?? 4, secondary: false };
									})
								}
							}
						]
					}
				}
			});
		}

		clients.forEach((c) => {
			c.emit(`${data.matchId}`, JSON.stringify({ type: "playerJoined", data: JSON.stringify({ nickname: data.nickname, teamId: data.teamId, playerId: locals.user?.id }) }));
		});

		await getMyData(data.matchId).refresh();

		return "Success";
	}
);

export const startGame = command(v.number(), async (matchId) => {
	await prisma.match.update({ where: { id: matchId }, data: { currentRound: 1 } });
	clients.forEach((c) => {
		c.emit(`${matchId}`, JSON.stringify({ type: "matchStart", data: "" }));
	});
});
