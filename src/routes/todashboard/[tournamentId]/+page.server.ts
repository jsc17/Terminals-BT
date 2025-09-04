import { error } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";

export const load = async ({ locals, params }) => {
	if (!locals.user) return error(401, "User is not logged in");
	let tournamentId = params.tournamentId;
	let tournamentData = await prisma.tournament.findUnique({ where: { id: Number(tournamentId), userId: locals.user.id }, include: { participants: true } });
	if (tournamentData == null) return error(403, "User does not have access to this tournament");

	return { tournamentData };
};
