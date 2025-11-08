import { error } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";

export const load = async ({ locals, params }) => {
	if (!locals.user) return error(401, "User is not logged in");
	let tournamentId = params.tournamentId;
	let tournamentData = await prisma.tournament.findUnique({ where: { id: Number(tournamentId) }, include: { participants: true } });
	if (tournamentData == null || (locals.user.id != tournamentData?.userId && locals.user.id != process.env.ADMIN_USER_ID))
		return error(403, "User does not have access to this tournament");

	return { tournamentData };
};
