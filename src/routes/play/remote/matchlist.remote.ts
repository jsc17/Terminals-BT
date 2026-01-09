import { query, form, command, getRequestEvent } from "$app/server";
import { prisma } from "$lib/server/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import {
	ConvertMatchSchema,
	CreateMatchSchema,
	CreateMatchWithListSchema,
	FindPrivateMatchSchema,
	JoinPrivateMatchWithListSchema,
	NicknameSchema
} from "../schema/matchlistSchema";
import { nanoid, customAlphabet } from "nanoid";
import { nothing } from "$lib/remote/utilities.remote";
import { invalid } from "@sveltejs/kit";

const stringId = customAlphabet("123456789abcdefghijklmnopqrstuvwxyz", 5);

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
		let id = stringId();
		while (await prisma.match.findUnique({ where: { id } })) id = stringId();

		const match = await prisma.match.create({
			data: {
				id,
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

	try {
		let id = stringId();
		while (await prisma.match.findUnique({ where: { id } })) id = stringId();
		const match = await prisma.match.create({
			data: {
				id,
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
	let id = stringId();
	while (await prisma.match.findUnique({ where: { id } })) id = stringId();

	const match = await prisma.match.create({
		data: {
			id,
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
});

export const findPrivateMatch = form(FindPrivateMatchSchema, async (data) => {
	const match = await prisma.match.findUnique({ where: { id: data.matchId }, select: { id: true, name: true, teams: true } });
	await nothing().refresh();
	return { status: match ? "success" : "failed", data: match };
});

export const joinPrivateMatchWithList = form(JoinPrivateMatchWithListSchema, async (data, issue) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const match = await prisma.match.findUnique({ where: { id: data.matchId }, select: { joinCode: true } });
	if (match?.joinCode != data.joinCode) invalid(issue.joinCode("Invalid Join Code"));

	const user = await prisma.usersInMatch.upsert({
		where: { match_player: { playerId: locals.user.id, matchId: data.matchId } },
		update: {
			lists: {
				create: {
					name: data.nickname,
					team: { connect: { id: data.teamId } },
					formations: {
						create: data.formations.map((f) => {
							const formationData = JSON.parse(f);
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
		},
		create: {
			playerNickname: data.nickname,
			playerRole: "PLAYER",
			match: { connect: { id: data.matchId } },
			player: { connect: { id: locals.user.id } },
			team: { connect: { id: data.teamId } },
			lists: {
				create: {
					name: data.nickname,
					team: { connect: { id: data.teamId } },
					formations: {
						create: data.formations.map((f) => {
							const formationData = JSON.parse(f);
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
	await nothing().refresh();
	return { status: "success" };
});
