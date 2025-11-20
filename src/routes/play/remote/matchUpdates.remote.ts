import { command, getRequestEvent } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import { clients } from "$lib/server/sseClients";

export const takeDamage = command(v.object({ unitId: v.number(), damage: v.number(), pending: v.boolean() }), async ({ unitId, damage, pending }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const result = await prisma.matchUnit.update({
		where: { id: unitId },
		data: pending ? { pendingDamage: { increment: damage } } : { currentDamage: { increment: damage } },
		select: { pendingDamage: true, currentDamage: true, formation: { select: { matchId: true } } }
	});
	clients.forEach((c) => {
		c.emit(
			`${result.formation.matchId}`,
			JSON.stringify({ type: "setDamage", data: JSON.stringify({ unitId, pendingDamage: result.pendingDamage, currentDamage: result.currentDamage }) })
		);
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
		c.emit(
			`${result.formation.matchId}`,
			JSON.stringify({ type: "setDamage", data: JSON.stringify({ unitId, pendingDamage: result.pendingDamage, currentDamage: result.currentDamage }) })
		);
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
		c.emit(`${result.formation.matchId}`, JSON.stringify({ type: "setHeat", data: JSON.stringify({ unitId, pendingHeat: result.pendingHeat, currentHeat: result.currentHeat }) }));
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
			c.emit(
				`${matchId}`,
				JSON.stringify({
					type: "takeCritical",
					data: JSON.stringify({ unitId, id: result.id, type: result.type, pending: result.pending, roundsRemaining: result.roundsRemaining })
				})
			);
		});
	}
);

export const removeCritical = command(v.object({ matchId: v.number(), critId: v.number() }), async ({ matchId, critId }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };

	const result = await prisma.matchCrit.delete({ where: { id: critId } });

	clients.forEach((c) => {
		c.emit(`${matchId}`, JSON.stringify({ type: "removeCritical", data: JSON.stringify({ id: result.id, unitId: result.unitId, pending: result.pending }) }));
	});
});



export const endRound = command(v.object({ matchId: v.number(), team1Score: v.number(), team2Score: v.number() }), async ({ matchId, team1Score, team2Score }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failure", message: "User is not logged in" };
});
