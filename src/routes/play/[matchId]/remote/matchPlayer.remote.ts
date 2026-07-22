import { command, getRequestEvent, form } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import { invalid } from "@sveltejs/kit";
import { getMyData } from "./matchData.remote";

async function createList(
	listName: string,
	list: { name: string; formations: string; units: string; bs: string | null },
	teamId: number,
	matchId: string,
	playerId: string,
	active: boolean
) {
	const newList = await prisma.matchList.create({
		data: {
			name: listName.length > 0 ? listName : list.name,
			team: { connect: { id: teamId } },
			player: { connect: { match_player: { matchId, playerId } } },
			active
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
										return { mulId: unit.mulId, skill: unit.skill ?? 4, secondary: false, spas: unit.customization?.spa?.join(","), ammo: unit.customization?.ammo?.join(",") };
									})
									.concat(
										(formation.secondary?.units ?? []).map((f: { id: string }) => {
											const unit = units.find((u: { id: string }) => u.id == f.id);
											return { mulId: unit.mulId, skill: unit.skill ?? 4, secondary: true, spas: unit.customization?.spa?.join(","), ammo: unit.customization?.ammo?.join(",") };
										})
									)
							}
						}
					]
				}
			}
		});
	}
	if (list.bs) {
		const bfs = JSON.parse(list.bs);
		await prisma.matchList.update({
			where: { id: newList.id },
			data: {
				battlefieldSupport: {
					create: bfs.map(([id, count]: [number, number]) => {
						return {
							bfsId: id,
							count: count
						};
					})
				}
			}
		});
	}
	return newList;
}
export const joinMatch = form(
	v.object({
		teamId: v.pipe(
			v.string(),
			v.transform((input) => Number(input))
		),
		matchId: v.string(),
		nickname: v.string(),
		listId: v.optional(v.string()),
		listName: v.optional(v.string())
	}),
	async ({ teamId, matchId, nickname, listId, listName }, issue) => {
		const { locals } = getRequestEvent();
		if (!locals.user) return undefined;

		if (!nickname) throw invalid("Player nickname is required");

		const match = await prisma.match.findUnique({ where: { id: matchId }, include: { players: true } });

		if (!match) throw invalid(issue.matchId("Invalid Match Id"));

		let newPlayer = await prisma.usersInMatch.create({
			data: {
				match: { connect: { id: match.id } },
				player: { connect: { id: locals.user.id } },
				playerNickname: nickname,
				playerRole: "PLAYER",
				team: { connect: { id: teamId } },
				joined: false
			}
		});

		await prisma.matchLog.create({
			data: {
				type: "PLAYER_JOIN_REQUEST",
				round: match?.currentRound ?? 0,
				match: { connect: { id: matchId } },
				submitter: { connect: { id: newPlayer?.id } },
				details: JSON.stringify({ nickname: nickname, id: newPlayer.id })
			}
		});

		if (listId) {
			const list = await prisma.listV3.findUnique({ where: { userId: locals.user.id, id: listId }, select: { units: true, name: true, formations: true, bs: true } });
			if (list == null) throw invalid(issue.listId("List could not be loaded. Please try again"));
			await createList(listName ?? list.name, list, teamId, matchId, locals.user.id, false);
		}
		await getMyData(matchId).refresh();

		return "Success";
	}
);

export const confirmPlayerJoin = command(v.object({ matchId: v.string(), playerId: v.number() }), async ({ matchId, playerId }) => {
	const match = await prisma.match.findUnique({ where: { id: matchId }, include: { players: true } });
	if (!match) return;

	const inactiveLists = await prisma.usersInMatch.findUnique({ where: { id: playerId }, include: { lists: { where: { active: false } } } });
	await prisma.usersInMatch.update({ where: { id: playerId }, data: { joined: true, lists: { updateMany: { where: { active: false }, data: { active: true } } } } });

	await prisma.matchLog.create({
		data: {
			type: "PLAYER_JOINED",
			round: match?.currentRound ?? 0,
			match: { connect: { id: matchId } },
			submitter: { connect: { id: playerId } }
		}
	});

	for (const list of inactiveLists?.lists ?? [])
		await prisma.matchLog.create({
			data: {
				type: "PLAYER_ADDED_LIST",
				round: match?.currentRound ?? 0,
				match: { connect: { id: matchId } },
				submitter: { connect: { id: playerId } },
				details: list.id
			}
		});
});

export const declinePlayerJoin = command(v.object({ matchId: v.string(), playerId: v.number() }), async ({ matchId, playerId }) => {
	const match = await prisma.match.findUnique({ where: { id: matchId }, include: { players: true } });
	if (!match) return;

	await prisma.usersInMatch.delete({ where: { id: playerId } });
	await prisma.matchLog.create({
		data: {
			type: "PLAYER_JOIN_DENIED",
			round: match?.currentRound ?? 0,
			match: { connect: { id: matchId } },
			submitter: { connect: { id: match.players.find((p) => p.playerRole == "HOST")!.id } },
			details: playerId
		}
	});
});

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

		const list = await prisma.listV3.findUnique({ where: { userId: locals.user.id, id: listId }, select: { units: true, name: true, formations: true, bs: true } });
		if (list == null) throw invalid(issue.listId("List could not be loaded. Please try again"));
		const newList = await createList(listName, list, teamId, matchId, locals.user.id, true);

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
