import { query, command, getRequestEvent, form } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import type { MatchUnit, MatchCrit, UsersInMatch } from "$lib/generated/prisma/browser";
import { UpdateMatchSchema } from "../../schema/matchlistSchema";
import { nothing } from "../../../validation/validate.remote";
import { invalid } from "@sveltejs/kit";
import type { MatchLog } from "$lib/generated/prisma/client";

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

export const getPlayerData = query(v.object({ playerId: v.number() }), async ({ playerId }) => {
	const results = await prisma.usersInMatch.findUnique({
		where: { id: playerId },
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
	async (data, issue) => {
		const { locals } = getRequestEvent();
		if (!locals.user) return undefined;

		const match = await prisma.match.findUnique({ where: { id: data.matchId }, include: { players: true } });
		const host = match?.players.find((p) => p.playerRole == "HOST");

		if (host?.playerId == locals.user.id) {
			await prisma.usersInMatch.update({
				where: { match_player: { playerId: locals.user.id, matchId: data.matchId } },
				data: { playerNickname: data.nickname, team: { connect: { id: data.teamId } } }
			});
		} else {
			if (!data.joinCode || data.joinCode != match?.joinCode) throw invalid(issue.joinCode("Invalid join code for this match"));
			if (!data.nickname) throw invalid("Player nickname is required");
			await prisma.match.update({
				where: { id: data.matchId },
				data: {
					players: { create: [{ player: { connect: { id: locals.user.id } }, playerNickname: data.nickname, playerRole: "PLAYER", team: { connect: { id: data.teamId } } }] }
				}
			});
		}

		const list = await prisma.listV3.findUnique({ where: { userId: locals.user.id, id: data.listId }, select: { units: true, formations: true } });
		if (list == null) throw invalid(issue.listId("List could not be loaded. Please try again"));

		let newPlayer: UsersInMatch | undefined = undefined;

		const units = JSON.parse(list.units);
		for (const formation of JSON.parse(list.formations)) {
			if (formation.units.length == 0) continue;
			newPlayer = await prisma.usersInMatch.update({
				where: { match_player: { playerId: locals.user.id, matchId: data.matchId } },
				data: {
					formations: {
						create: [
							{
								name: formation.name,
								type: formation.type,
								secondaryType: formation.secondary ? formation.secondary.type : undefined,
								units: {
									create: formation.units
										.map((f: { id: string }) => {
											const unit = units.find((u: { id: string }) => u.id == f.id);
											return { mulId: unit.mulId, skill: unit.skill ?? 4, secondary: false };
										})
										.concat(
											(formation.secondary?.units ?? []).map((f: { id: string }) => {
												const unit = units.find((u: { id: string }) => u.id == f.id);
												return { mulId: unit.mulId, skill: unit.skill ?? 4, secondary: true };
											})
										)
								}
							}
						]
					}
				}
			});
		}
		await prisma.matchLog.create({
			data: {
				type: "PLAYER_JOINED",
				round: match?.currentRound ?? 0,
				match: { connect: { id: data.matchId } },
				submitter: { connect: { id: newPlayer?.id } }
			}
		});

		await getMyData(data.matchId).refresh();

		return "Success";
	}
);

export const updateMatchData = form(UpdateMatchSchema, async ({ matchId, name, joinCode, teamNames, teamScores, currentRound, privateMatch }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const matchData = await prisma.match.findUnique({ where: { id: matchId }, include: { players: { where: { playerRole: "HOST" } } } });
	if (matchData != null && matchData.players[0].playerId == locals.user.id) {
		await prisma.match.update({
			where: { id: matchId },
			data: {
				name,
				joinCode,
				currentRound,
				private: privateMatch,
				logEntries: { create: { round: matchData.currentRound, type: "MATCH_UPDATE", submitter: { connect: { id: matchData.players[0].id } } } }
			}
		});
		const existingTeams = await prisma.matchTeam.findMany({ where: { matchId } });
		await Promise.all(
			existingTeams.map(async (team, index) => prisma.matchTeam.update({ where: { id: team.id }, data: { name: teamNames[index], objectivePoints: teamScores[index] } }))
		);
	}
	await nothing().refresh();
});

export const deleteMatch = command(v.number(), async (matchId) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };
	console.log("match deleted");
	const matchData = await prisma.match.findUnique({ where: { id: matchId }, include: { players: { where: { playerRole: "HOST" } } } });
	if (matchData != null && matchData.players[0].playerId == locals.user.id) {
		await prisma.match.delete({ where: { id: matchId } });
	}
});

export const kickPlayer = command(v.object({ matchId: v.number(), playerId: v.number() }), async ({ matchId, playerId }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const matchData = await prisma.match.findUnique({ where: { id: matchId }, include: { players: { where: { playerRole: "HOST" } } } });
	if (matchData != null && matchData.players[0].playerId == locals.user.id) {
		await prisma.usersInMatch.delete({ where: { id: playerId } });
		await prisma.match.update({
			where: { id: matchId },
			data: { logEntries: { create: { round: matchData.currentRound, type: "REMOVE_PLAYER", affectedUser: playerId, submitter: { connect: { id: matchData.players[0].id } } } } }
		});
	}
});

export const getLogs = query(v.object({ matchId: v.number(), lastLogId: v.number() }), async ({ matchId, lastLogId }) => {
	const logs = await prisma.matchLog.findMany({ where: { matchId: matchId, id: { gt: lastLogId } } });
	return logs;
});
