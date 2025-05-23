import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma.js";

export const actions = {
	loadLists: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		const lists = await prisma.listV3.findMany({
			where: {
				userId: locals.user.id
			},
			orderBy: {
				name: "asc"
			},
			select: {
				name: true,
				units: true,
				formations: true
			}
		});

		if (!lists) {
			return fail(400, { message: "Failed to retrieve lists" });
		}
		return { lists: JSON.stringify(lists) };
	},
	getCost: async (event) => {
		const mulId = Number((await event.request.formData()).get("mulId"));
		const pv = await prisma.unit.findUnique({ where: { mulId }, select: { pv: true } });
		return pv;
	}
};
