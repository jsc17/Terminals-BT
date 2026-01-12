import { command, getRequestEvent } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";

const RemoteDamageSchema = v.object({ matchId: v.string(), unitId: v.number(), damage: v.number(), pending: v.boolean() });
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
			details: damage,
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
			details: damage,
			applied: pending,
			match: { connect: { id: matchId } },
			submitter: { connect: { id: match?.players[0].id } }
		}
	});
});

export const setHeat = command(
	v.object({ matchId: v.string(), unitId: v.number(), heatLevel: v.number(), pending: v.boolean() }),
	async ({ matchId, unitId, heatLevel, pending }) => {
		const { locals } = getRequestEvent();
		if (!locals.user) return { status: "failure", message: "User is not logged in" };
		const match = await prisma.match.findUnique({ where: { id: matchId }, include: { players: { where: { player: { id: locals.user.id } } } } });

		await prisma.matchUnit.update({
			where: { id: unitId },
			data: pending ? { pendingHeat: heatLevel } : { currentHeat: heatLevel, pendingHeat: heatLevel }
		});

		await prisma.matchLog.create({
			data: {
				type: "UNIT_HEAT",
				unitId,
				round: match?.currentRound ?? 0,
				details: heatLevel,
				applied: pending,
				match: { connect: { id: matchId } },
				submitter: { connect: { id: match?.players[0].id } }
			}
		});
	}
);

export const takeCritical = command(
	v.object({ matchId: v.string(), unitId: v.number(), type: v.string(), pending: v.boolean(), rounds: v.optional(v.number()) }),
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
				details: result.type,
				match: { connect: { id: matchId } },
				submitter: { connect: { id: match?.players[0].id } }
			}
		});
	}
);

export const removeCritical = command(v.object({ matchId: v.string(), critId: v.number() }), async ({ matchId, critId }) => {
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
			details: result.type,
			match: { connect: { id: matchId } },
			submitter: { connect: { id: match?.players[0].id } }
		}
	});
});
