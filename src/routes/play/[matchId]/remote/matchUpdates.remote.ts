import { command, form, getRequestEvent } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import { clients } from "$lib/server/sseClients";
import { nothing } from "../../../validation/validate.remote";

export const takeDamage = command(v.object({ unitId: v.number(), damage: v.number(), pending: v.boolean() }), async ({ unitId, damage, pending }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const result = await prisma.matchUnit.update({
		where: { id: unitId },
		data: pending ? { pendingDamage: { increment: damage } } : { currentDamage: { increment: damage } },
		select: { pendingDamage: true, currentDamage: true, formation: { select: { matchId: true } } }
	});
	clients.forEach((c) => {
		c.emit(`${result.formation.matchId}`, JSON.stringify({ type: "updateUnit", data: unitId, time: Date.now() }));
	});
});

export const removeDamage = command(v.object({ unitId: v.number(), damage: v.number(), pending: v.boolean() }), async ({ unitId, damage, pending }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const result = await prisma.matchUnit.update({
		where: { id: unitId },
		data: pending ? { pendingDamage: { decrement: damage } } : { currentDamage: { decrement: damage } },
		select: { pendingDamage: true, currentDamage: true, formation: { select: { matchId: true } } }
	});
	clients.forEach((c) => {
		c.emit(`${result.formation.matchId}`, JSON.stringify({ type: "updateUnit", data: unitId, time: Date.now() }));
	});
});

export const setHeat = command(v.object({ unitId: v.number(), heatLevel: v.number(), pending: v.boolean() }), async ({ unitId, heatLevel, pending }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const result = await prisma.matchUnit.update({
		where: { id: unitId },
		data: pending ? { pendingHeat: heatLevel } : { currentHeat: heatLevel, pendingHeat: heatLevel },
		select: { pendingHeat: true, currentHeat: true, formation: { select: { matchId: true } } }
	});
	clients.forEach((c) => {
		c.emit(`${result.formation.matchId}`, JSON.stringify({ type: "updateUnit", data: unitId, time: Date.now() }));
	});
});

export const takeCritical = command(
	v.object({ matchId: v.number(), unitId: v.number(), type: v.string(), pending: v.boolean(), rounds: v.optional(v.number()) }),
	async ({ matchId, unitId, type, pending, rounds }) => {
		const { locals } = getRequestEvent();
		if (!locals.user) return { status: "failure", message: "User is not logged in" };

		const currentround = (await prisma.match.findUnique({ where: { id: matchId }, select: { currentRound: true } }))?.currentRound;
		const result = await prisma.matchCrit.create({
			data: { type, pending, roundsRemaining: rounds, round: currentround ?? 0, unit: { connect: { id: unitId } } }
		});
		clients.forEach((c) => {
			c.emit(`${matchId}`, JSON.stringify({ type: "updateUnit", data: unitId, time: Date.now() }));
		});
	}
);

export const removeCritical = command(v.object({ matchId: v.number(), critId: v.number() }), async ({ matchId, critId }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const result = await prisma.matchCrit.delete({ where: { id: critId } });

	clients.forEach((c) => {
		c.emit(`${matchId}`, JSON.stringify({ type: "updateUnit", data: result.unitId, time: Date.now() }));
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
		const matchDetails = await prisma.match.update({ where: { id: matchId }, data: { currentRound: { increment: 1 } } });
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

		clients.forEach((c) => c.emit(`${matchId}`, JSON.stringify({ type: "roundEnd", data: {} })));
		await nothing().refresh();
	}
);
