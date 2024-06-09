import { fail } from "@sveltejs/kit";

export const actions = {
	getListNames: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		const lists = await prisma.list.findMany({
			where: {
				userId: locals.user.id
			},
			select: {
				name: true
			}
		});

		return { listNames: JSON.stringify(lists) };
	}
};
