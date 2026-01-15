import { getRequestEvent, query } from "$app/server";
import { prisma } from "$lib/server/prisma";
import { List, type ListCode } from "$lib/types/list.svelte";
import * as v from "valibot";

export const getUsersLists = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "User not logged in" };

	const results = await prisma.listV3.findMany({ where: { userId: locals.user.id } });

	return { status: "success", data: results };
});

export const loadSharedList = query(v.string(), async (sharedListId) => {
	const listData = await prisma.sharedList.findUnique({ where: { id: sharedListId } });

	if (!listData) return undefined;

	let listCode: ListCode = {
		id: crypto.randomUUID(),
		lcVersion: listData.lcVersion,
		name: listData.name,
		eras: JSON.parse(listData.eras) ?? [],
		factions: JSON.parse(listData.factions) ?? [],
		rules: listData.rules ?? "noRes",
		units: JSON.parse(listData.units),
		formations: JSON.parse(listData.formations),
		sublists: JSON.parse(listData.sublists),
		scas: listData.scas ? JSON.parse(listData.scas) : undefined
	};

	return listCode;
});
