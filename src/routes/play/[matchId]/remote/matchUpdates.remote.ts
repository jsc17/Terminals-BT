import { command, form, getRequestEvent } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import { nothing } from "../../../validation/validate.remote";
import { getSubmitter } from "./utilities";

export const startGame = command(v.number(), async (matchId) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };
	const submitter = await getSubmitter(matchId, locals.user.id);
	if (submitter?.playerRole != "HOST" && submitter?.playerRole != "MODERATOR") return { status: "failure", message: "User does not have permission to start this game" };

	await prisma.match.update({
		where: { id: matchId },
		data: { currentRound: 1, logEntries: { create: { submitter: { connect: { id: submitter.id } }, round: 1, type: "MATCH_START" } } }
	});
});

const RemoteDamageSchema = v.object({ matchId: v.number(), unitId: v.number(), damage: v.number(), pending: v.boolean() });
export const takeDamage = command(RemoteDamageSchema, async ({ matchId, unitId, damage, pending }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const match = await prisma.match.findUnique({ where: { id: matchId }, include: { players: { where: { player: { id: locals.user.id } } } } });

	const data = pending ? { pendingDamage: { increment: damage } } : { currentDamage: { increment: damage } };
	await prisma.matchUnit.update({ where: { id: unitId }, data });

	await prisma.matchLog.create({
		data: {
			type: "UNIT_DAMAGE",
			unitId,
			round: match?.currentRound ?? 0,
			damage,
			applied: pending,
			match: { connect: { id: matchId } },
			submitter: { connect: { id: match?.players[0].id } }
		}
	});
});

export const removeDamage = command(RemoteDamageSchema, async ({ matchId, unitId, damage, pending }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };
	const match = await prisma.match.findUnique({ where: { id: matchId }, include: { players: { where: { player: { id: locals.user.id } } } } });

	const data = pending ? { pendingDamage: { decrement: damage } } : { currentDamage: { decrement: damage } };
	await prisma.matchUnit.update({ where: { id: unitId }, data });

	await prisma.matchLog.create({
		data: {
			type: "UNIT_DAMAGE_REMOVED",
			unitId,
			round: match?.currentRound ?? 0,
			damage,
			applied: pending,
			match: { connect: { id: matchId } },
			submitter: { connect: { id: match?.players[0].id } }
		}
	});
});

export const setHeat = command(
	v.object({ matchId: v.number(), unitId: v.number(), heatLevel: v.number(), pending: v.boolean() }),
	async ({ matchId, unitId, heatLevel, pending }) => {
		const { locals } = getRequestEvent();
		if (!locals.user) return { status: "failure", message: "User is not logged in" };
		const match = await prisma.match.findUnique({ where: { id: matchId }, include: { players: { where: { player: { id: locals.user.id } } } } });

		await prisma.matchUnit.update({
			where: { id: unitId },
			data: pending ? { pendingHeat: heatLevel } : { currentHeat: heatLevel, pendingHeat: heatLevel },
			select: { pendingHeat: true, currentHeat: true, formation: { select: { matchId: true } } }
		});

		await prisma.matchLog.create({
			data: {
				type: "UNIT_HEAT",
				unitId,
				round: match?.currentRound ?? 0,
				heat: heatLevel,
				applied: pending,
				match: { connect: { id: matchId } },
				submitter: { connect: { id: match?.players[0].id } }
			}
		});
	}
);

export const takeCritical = command(
	v.object({ matchId: v.number(), unitId: v.number(), type: v.string(), pending: v.boolean(), rounds: v.optional(v.number()) }),
	async ({ matchId, unitId, type, pending, rounds }) => {
		const { locals } = getRequestEvent();
		if (!locals.user) return { status: "failure", message: "User is not logged in" };
		const match = await prisma.match.findUnique({ where: { id: matchId }, include: { players: { where: { player: { id: locals.user.id } } } } });

		const currentround = (await prisma.match.findUnique({ where: { id: matchId }, select: { currentRound: true } }))?.currentRound;
		const result = await prisma.matchCrit.create({
			data: { type, pending, roundsRemaining: rounds, round: currentround ?? 0, unit: { connect: { id: unitId } } }
		});
		await prisma.matchLog.create({
			data: {
				type: "UNIT_CRIT",
				unitId,
				round: match?.currentRound ?? 0,
				applied: pending,
				critical: result.type,
				match: { connect: { id: matchId } },
				submitter: { connect: { id: match?.players[0].id } }
			}
		});
	}
);

export const removeCritical = command(v.object({ matchId: v.number(), critId: v.number() }), async ({ matchId, critId }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const match = await prisma.match.findUnique({ where: { id: matchId }, include: { players: { where: { player: { id: locals.user.id } } } } });

	const result = await prisma.matchCrit.delete({ where: { id: critId } });
	await prisma.matchLog.create({
		data: {
			type: "UNIT_CRIT_REMOVED",
			unitId: result.unitId,
			round: match?.currentRound ?? 0,
			applied: result.pending,
			critical: result.type,
			match: { connect: { id: matchId } },
			submitter: { connect: { id: match?.players[0].id } }
		}
	});
});

export const endRound = form(
	v.object({
		matchId: v.pipe(
			v.string(),
			v.transform((input) => Number(input))
		),
		teamScores: v.array(v.number())
	}),
	async ({ matchId, teamScores }) => {
		const { locals } = getRequestEvent();
		if (!locals.user) return { status: "failure", message: "User is not logged in" };

		//get existing match data
		const existingTeams = await prisma.matchTeam.findMany({ where: { matchId } });
		const existingUnits = await prisma.matchUnit.findMany({ where: { formation: { matchId } } });

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
