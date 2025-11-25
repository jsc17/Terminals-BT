import { query, form, command, getRequestEvent } from "$app/server";
import { prisma } from "$lib/server/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { CreateMatchSchema, NicknameSchema } from "../schema/matchlistSchema";
import * as v from "valibot";
import { clients } from "$lib/server/sseClients";

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
		await prisma.match.create({
			data: {
				name: data.name,
				joinCode: data.joinCode,
				private: data.private,
				players: { create: { player: { connect: { id: locals.user.id } }, playerNickname: data.hostNickname, playerRole: "HOST" } },
				teams: { createMany: { data: data.teamNames.map((d) => ({ name: d })) } }
			}
		});
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

export const deleteMatch = command(v.number(), async (matchId) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const matchData = await prisma.match.findUnique({ where: { id: matchId }, include: { players: { where: { playerRole: "HOST" } } } });
	if (matchData != null && matchData.players[0].playerId == locals.user.id) await prisma.match.delete({ where: { id: matchId } });

	clients.forEach((c) => {
		c.emit(`${matchId}`, JSON.stringify({ type: "matchDelete", data: {} }));
	});
});
