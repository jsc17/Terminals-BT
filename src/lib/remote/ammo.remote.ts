import { query } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";

export const getAmmoByName = query.batch(v.string(), async (names) => {
	const results = await prisma.ammo.findMany({ where: { name: { in: names } } });
	const lookup = new Map(results.map((r) => [r.name, r]));
	return (name) => lookup.get(name);
});
