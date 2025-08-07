import { query, prerender } from "$app/server";
import { prisma } from "$lib/server/prisma";
import * as z from "zod";

export const getEras = prerender(async () => {
	const eras = await prisma.era.findMany();
	return eras;
});

export const getFactionsInEra = query(z.number().array(), async (eras: number[]) => {
	const factionList = await prisma.factionInEra.findMany({
		where: {
			eraId: { in: eras }
		},
		include: {
			faction: {
				select: { name: true }
			}
		},
		orderBy: {
			faction: {
				name: "asc"
			}
		}
	});
	return factionList;
});

export const getGeneralId = query(z.object({ era: z.number(), faction: z.number() }), async (data) => {
	const id = await prisma.factionInEra.findFirst({
		where: { eraId: data.era, factionId: data.faction },
		select: {
			general: true
		}
	});
	return id;
});

export const getEraName = query(z.number(), async (idToFind) => {
	const result = await prisma.era.findUnique({ where: { id: idToFind }, select: { name: true } });
	return result?.name ?? "Not Found";
});

export const getFactionName = query(z.number(), async (idToFind) => {
	const result = await prisma.faction.findUnique({ where: { id: idToFind }, select: { name: true } });
	return result?.name ?? "Not Found";
});
