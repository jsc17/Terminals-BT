import { command, form, getRequestEvent } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import { getSubmitter } from "./utilities";
import { nothing } from "$lib/remote/utilities.remote";
import { UpdateMatchSchema } from "../../schema/matchlistSchema";

export const startGame = command(v.string(), async (matchId) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };
	const submitter = await getSubmitter(matchId, locals.user.id);
	if (submitter?.playerRole != "HOST" && submitter?.playerRole != "MODERATOR") return { status: "failure", message: "User does not have permission to start this game" };

	await prisma.match.update({
		where: { id: matchId },
		data: { currentRound: 1, logEntries: { create: { submitter: { connect: { id: submitter.id } }, round: 1, type: "MATCH_START" } } }
	});
});

export const endRound = form(
	v.object({
		matchId: v.string(),
		teamScores: v.array(v.number())
	}),
	async ({ matchId, teamScores }) => {
		const { locals } = getRequestEvent();
		if (!locals.user) return { status: "failure", message: "User is not logged in" };

		//get existing match data
		const existingTeams = await prisma.matchTeam.findMany({ where: { matchId } });
		const existingUnits = await prisma.matchUnit.findMany({ where: { formation: { list: { matchId } } } });

		//update match data
		const match = await prisma.match.update({
			where: { id: matchId },
			data: { currentRound: { increment: 1 } },
			include: { players: { where: { player: { id: locals.user.id } } } }
		});
		const updatedTeams = await Promise.all(
			existingTeams.map((team, index) => prisma.matchTeam.update({ where: { id: team.id }, data: { objectivePoints: { increment: teamScores[index] } } }))
		);
		const updatedUnits = await Promise.all(
			existingUnits.map(async (u) => {
				await prisma.matchUnit.update({
					where: { id: u.id },
					data: {
						currentDamage: { increment: u.pendingDamage },
						pendingDamage: 0,
						currentHeat: u.pendingHeat,
						criticals: { updateMany: { where: { unitId: u.id }, data: { pending: false } } }
					}
				});
			})
		);

		await prisma.matchLog.create({
			data: {
				type: "ROUND_END",
				round: match?.currentRound ?? 0,
				match: { connect: { id: matchId } },
				submitter: { connect: { id: match?.players[0].id } }
			}
		});
		await nothing().refresh();
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

export const kickPlayer = command(v.object({ matchId: v.string(), playerId: v.number() }), async ({ matchId, playerId }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const matchData = await prisma.match.findUnique({ where: { id: matchId }, include: { players: { where: { playerRole: "HOST" } } } });
	if (matchData != null && matchData.players[0].playerId == locals.user.id) {
		await prisma.usersInMatch.delete({ where: { id: playerId } });
		await prisma.match.update({
			where: { id: matchId },
			data: { logEntries: { create: { round: matchData.currentRound, type: "REMOVE_PLAYER", details: playerId, submitter: { connect: { id: matchData.players[0].id } } } } }
		});
	}
});
