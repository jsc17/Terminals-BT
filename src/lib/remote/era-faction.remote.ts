import { query, prerender } from "$app/server";
import { prisma } from "$lib/server/prisma";
import * as z from "zod";

export const getErasAndFactions = query(async () => {
	const results = await prisma.factionInEra.findMany({ select: { eraId: true, faction: true }, orderBy: [{ era: { order: "asc" } }, { faction: { name: "asc" } }] });
	const groupedResults = new Map<number, { id: number; name: string }[]>();
	results.forEach((r) => {
		if (groupedResults.has(r.eraId)) {
			groupedResults.set(r.eraId, groupedResults.get(r.eraId)!.concat([r.faction]));
		} else {
			groupedResults.set(r.eraId, [r.faction]);
		}
	});
	return groupedResults;
});

export const getEraNames = query(async () => {
	const eraNames = await prisma.era.findMany({ select: { id: true, name: true } });
	const eraNameLookup = new Map(eraNames.map((r) => [r.id, r.name]));
	return eraNameLookup;
});

export const getEras = prerender(async () => {
	const eras = await prisma.era.findMany({ select: { id: true, name: true }, orderBy: { order: "asc" } });
	return eras;
});

export const getFactions = prerender(async () => {
	const factions = await prisma.faction.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
	return factions;
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
