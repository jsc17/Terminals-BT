import { query, form, command, getRequestEvent } from "$app/server";
import { prisma } from "$lib/server/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { ConvertMatchSchema, CreateMatchSchema, CreateMatchWithListSchema, NicknameSchema } from "../schema/matchlistSchema";
import { nanoid } from "nanoid";
import { getMULDataFromId } from "$lib/remote/unit.remote";

export const getNickname = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) return "Not Logged In";

	const result = await prisma.user.findUnique({ where: { id: locals.user.id }, select: { playModeNickname: true, username: true } });
	if (result == null) return "User not found";
	if (result?.playModeNickname == "") return result.username;
	return result.playModeNickname;
});

export const setNickname = form(NicknameSchema, async (data) => {
	const { locals } = getRequestEvent();
	if (locals.user) {
		await prisma.user.update({ where: { id: locals.user.id }, data: { playModeNickname: data.nickname } });
		await getNickname().refresh();
	}
});

export const getMatches = query(async () => {
	const { locals } = getRequestEvent();

	const publicMatches = await prisma.match.findMany({ where: { private: false }, select: { id: true, name: true, createdAt: true } });

	const myMatches = !locals.user
		? []
		: await prisma.match.findMany({ where: { players: { some: { playerId: locals.user.id } } }, select: { id: true, name: true, createdAt: true } });

	return [myMatches, publicMatches];
});

export const refreshMatches = command(async () => {
	await getMatches().refresh();
});

export const createMatch = form(CreateMatchSchema, async (data) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	try {
		const match = await prisma.match.create({
			data: {
				name: data.name,
				joinCode: data.joinCode,
				private: data.private,
				players: {
					create: { player: { connect: { id: locals.user.id } }, playerNickname: data.hostNickname, playerRole: "HOST" }
				},
				teams: { createMany: { data: data.teamNames.map((d) => ({ name: d })) } }
			},
			include: { players: true }
		});
		await prisma.matchLog.create({ data: { round: 0, type: "MATCH_CREATED", match: { connect: { id: match.id } }, submitter: { connect: { id: match.players[0].id } } } });
		await getMatches().refresh();
		return { status: "success", message: "Match created" };
	} catch (error: unknown) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code == "P2002") {
				switch (error.meta?.target) {
					case "Match_name_key":
						return { status: "failure", message: "Match name already exists. Please choose a different name." };
					case "Match_joinCode_key":
						return { status: "failure", message: "Join code already in use. Please try a different code." };
				}
			}
		} else {
			console.log(error);
			return { status: "failure", message: "Match name already exists. Please choose a different name." };
		}
	}
});

export const createMatchWithList = form(CreateMatchWithListSchema, async (data) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	console.log(data);
	try {
		const match = await prisma.match.create({
			data: {
				name: data.name,
				joinCode: data.joinCode,
				private: data.private,
				players: {
					create: { player: { connect: { id: locals.user.id } }, playerNickname: data.hostNickname, playerRole: "HOST" }
				},
				teams: { createMany: { data: data.teamNames.map((d) => ({ name: d })) } }
			},
			include: { players: true, teams: true }
		});
		await prisma.usersInMatch.update({
			where: { match_player: { matchId: match.id, playerId: locals.user.id } },
			data: {
				team: { connect: { id: match.teams[0].id } },
				lists: {
					create: {
						name: data.name,
						team: { connect: { id: match.teams[0].id } },
						formations: {
							create: data.formations.map((f) => {
								const formationData = JSON.parse(f);
								console.log(formationData);
								return {
									name: formationData.name,
									type: formationData.type,
									secondaryType: formationData.secondary,
									units: {
										create: formationData.units.map(({ mulId, skill, secondary }: { mulId: number; skill: number; secondary: boolean }) => {
											return {
												mulId,
												skill,
												secondary
											};
										})
									}
								};
							})
						}
					}
				}
			}
		});
		await prisma.matchLog.create({ data: { round: 0, type: "MATCH_CREATED", match: { connect: { id: match.id } }, submitter: { connect: { id: match.players[0].id } } } });
		return { status: "success", message: `${match.id}` };
	} catch (error: unknown) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code == "P2002") {
				switch (error.meta?.target) {
					case "Match_name_key":
						return { status: "failure", message: "Match name already exists. Please choose a different name." };
					case "Match_joinCode_key":
						return { status: "failure", message: "Join code already in use. Please try a different code." };
				}
			}
		} else {
			console.log(error);
			return { status: "failure", message: "Match name already exists. Please choose a different name." };
		}
	}
});

export const convertLocalMatchToServer = command(ConvertMatchSchema, async (data) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "User is not logged in" };

	let matchName = data.name;
	if (await prisma.match.findUnique({ where: { name: matchName } })) matchName = matchName + `(${nanoid(3)})`;

	const nickname = await getNickname();

	const match = await prisma.match.create({
		data: {
			name: matchName,
			private: true,
			joinCode: nanoid(6),
			players: {
				create: { player: { connect: { id: locals.user.id } }, playerNickname: nickname, playerRole: "HOST" }
			},
			teams: { create: [{ name: "Red" }, { name: "Blue" }] }
		},
		select: { id: true, players: true, teams: true }
	});

	await prisma.usersInMatch.update({
		where: { match_player: { matchId: match.id, playerId: locals.user.id } },
		data: {
			team: { connect: { id: match.teams[0].id } },
			lists: {
				create: {
					name: data.name,
					team: { connect: { id: match.teams[0].id } },
					formations: {
						create: data.formations.map((f) => ({
							name: f.name,
							type: f.type,
							secondaryType: f.secondary?.type,
							units: {
								create: f.units.map((uId) => {
									const unitData = data.units.find((u) => u.id == uId);
									return {
										mulId: Number(unitData!.mulId),
										skill: unitData!.skill ?? 4,
										secondary: false,
										pendingDamage: unitData!.pending.damage,
										pendingHeat: unitData!.pending.heat,
										currentDamage: unitData!.current.damage,
										currentHeat: unitData!.current.heat
									};
								})
							}
						}))
					}
				}
			}
		}
	});
	console.log(data);
});
