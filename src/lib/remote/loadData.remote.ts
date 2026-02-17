import { query } from "$app/server";
import { prisma } from "$lib/server/prisma";

export const getAllUnits = query(async () => {
	const units = await prisma.unit.findMany();
	return units;
});

export const getAllFactions = query(async () => {
	const factions = await prisma.faction.findMany();
	return factions;
});

export const getAllEras = query(async () => {
	const eras = await prisma.era.findMany();
	return eras;
});

export const getAllFactionInEras = query(async () => {
	const factionInEras = await prisma.factionInEra.findMany();
	return factionInEras;
});

export const getAllAvailabilities = query(async () => {
	const availabilities = await prisma.availability.findMany();
	return availabilities;
});
