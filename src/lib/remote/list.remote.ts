import { getRequestEvent, query } from "$app/server";
import { prisma } from "$lib/server/prisma";

export const getUsersLists = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "User not logged in" };

	const results = await prisma.listV3.findMany({ where: { userId: locals.user.id } });

	return { status: "success", data: results };
});
