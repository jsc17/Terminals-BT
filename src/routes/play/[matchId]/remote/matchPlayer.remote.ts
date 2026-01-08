import { query, command, getRequestEvent, form } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import type { MatchUnit, MatchCrit, UsersInMatch } from "$lib/generated/prisma/browser";
import { UpdateMatchSchema } from "../../schema/matchlistSchema";
import { nothing } from "$lib/remote/utilities.remote";
import { invalid } from "@sveltejs/kit";
import { getMyData } from "./matchData.remote";

export const joinMatch = form(
	v.object({
		teamId: v.pipe(
			v.string(),
			v.transform((input) => Number(input))
		),
		matchId: v.string(),
		joinCode: v.optional(v.string()),
		nickname: v.string()
	}),
	async (data, issue) => {
		const { locals } = getRequestEvent();
		if (!locals.user) return undefined;

		if (!data.nickname) throw invalid("Player nickname is required");

		const match = await prisma.match.findUnique({ where: { id: data.matchId }, include: { players: true } });

		if (!match) throw invalid(issue.matchId("Invalid Match Id"));
		if (!data.joinCode || data.joinCode != match!.joinCode) throw invalid(issue.joinCode("Invalid join code for this match"));

		let newPlayer = await prisma.usersInMatch.create({
			data: {
				match: { connect: { id: match.id } },
				player: { connect: { id: locals.user.id } },
				playerNickname: data.nickname,
				playerRole: "PLAYER",
				team: { connect: { id: data.teamId } }
			}
		});

		if (newPlayer == null) console.log("");

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

export const loadList = form(
	v.object({
		teamId: v.pipe(
			v.string(),
			v.transform((input) => Number(input))
		),
		matchId: v.string(),
		listId: v.string(),
		listName: v.string()
	}),
	async ({ teamId, matchId, listId, listName }, issue) => {
		const { locals } = getRequestEvent();
		if (!locals.user) return undefined;

		const match = await prisma.match.findUnique({ where: { id: matchId } });
		if (!match) throw invalid(issue.matchId("Invalid Match Id"));

		const list = await prisma.listV3.findUnique({ where: { userId: locals.user.id, id: listId }, select: { units: true, formations: true } });
		if (list == null) throw invalid(issue.listId("List could not be loaded. Please try again"));

		const newList = await prisma.matchList.create({
			data: {
				name: listName,
				team: { connect: { id: teamId } },
				player: { connect: { match_player: { matchId, playerId: locals.user.id } } }
			},
			include: { player: true }
		});

		const units = JSON.parse(list.units);
		for (const formation of JSON.parse(list.formations)) {
			if (formation.units.length == 0) continue;
			await prisma.matchList.update({
				where: { id: newList.id },
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
				type: "PLAYER_ADDED_LIST",
				round: match?.currentRound ?? 0,
				match: { connect: { id: matchId } },
				submitter: { connect: { id: newList.player.id } },
				details: newList.id
			}
		});

		return "Success";
	}
);
