import { command } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import { clients } from "$lib/server/sseClients";

export const takeDamage = command(v.object({ unitId: v.number(), damage: v.number(), pending: v.boolean() }), async ({ unitId, damage, pending }) => {
	const result = await prisma.matchUnit.update({
		where: { id: unitId },
		data: pending ? { pendingDamage: { increment: damage } } : { currentDamage: { increment: damage } },
		select: { pendingDamage: true, currentDamage: true, formation: { select: { matchId: true } } }
	});
	clients.forEach((c) => {
		c.emit(
			`${result.formation.matchId}`,
			JSON.stringify({ type: "damageTaken", data: JSON.stringify({ unitId, pendingDamage: result.pendingDamage, currentDamage: result.currentDamage }) })
		);
	});
});

export const setHeat = command(v.object({ unitId: v.number(), heatLevel: v.number(), pending: v.boolean() }), async ({ unitId, heatLevel, pending }) => {
	const result = await prisma.matchUnit.update({
		where: { id: unitId },
		data: pending ? { pendingHeat: heatLevel } : { currentHeat: heatLevel, pendingHeat: heatLevel },
		select: { pendingHeat: true, currentHeat: true, formation: { select: { matchId: true } } }
	});
	clients.forEach((c) => {
		c.emit(
			`${result.formation.matchId}`,
			JSON.stringify({ type: "heatChanged", data: JSON.stringify({ unitId, pendingHeat: result.pendingHeat, currentHeat: result.currentHeat }) })
		);
	});
});
