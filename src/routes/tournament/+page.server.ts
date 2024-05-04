import { type Actions, fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";

export const actions: Actions = {
	addTournament: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}

		const { tournamentName, tournamentDate, organizerName, contactEmail, tournamentEra } = Object.fromEntries(await request.formData()) as Record<string, string>;

		let tournament_date = new Date(tournamentDate);
		let passed = false;
		if (tournament_date < new Date()) {
			passed = true;
		}
		try {
			let tournament = await prisma.tournament.create({
				data: {
					userId: locals.user.id,
					name: tournamentName,
					era: Number(tournamentEra),
					tournament_date,
					email: contactEmail,
					organizer: organizerName != "" ? organizerName : locals.user.username,
					passed
				}
			});
			return { message: "Tournament added successfully", id: tournament.userId };
		} catch (error) {
			console.log(error);
			return fail(400, { message: "Failed to create tournament" });
		}
	},
	getTournaments: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}

		try {
			const tournamentList = await prisma.tournament.findMany({
				where: {
					userId: locals.user.id
				},
				include: {
					participants: {
						include: {
							listCodes: true
						}
					}
				}
			});
			return { message: "Tournaments retrieved successfully", tournamentList: JSON.stringify(tournamentList) };
		} catch (error) {
			console.log(error);
			return fail(400, { message: "Failed to retrieve tournaments" });
		}
	},
	updateTournament: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}

		const { id, tournamentName, tournamentDate, organizerName, contactEmail, tournamentEra } = Object.fromEntries(await request.formData()) as Record<string, string>;
		try {
			await prisma.tournament.update({
				where: {
					id: Number(id)
				},
				data: {
					name: tournamentName,
					era: Number(tournamentEra),
					tournament_date: new Date(tournamentDate),
					email: contactEmail,
					organizer: organizerName != "" ? organizerName : locals.user.username
				}
			});
			return { message: "Tournament updated successfully" };
		} catch (error) {
			console.log(error);
			return fail(400, { message: "Failed to update tournament" });
		}
	},
	deleteTournament: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		let { tournamentId } = Object.fromEntries(await request.formData()) as Record<string, string>;
		try {
			await prisma.tournament.delete({
				where: {
					id: Number(tournamentId)
				}
			});
			return { message: "Tournament delete successfully" };
		} catch (error) {
			console.log(error);
			return fail(400, { message: "Failed to delete tournament" });
		}
	},
	getUnits: async ({ request }) => {
		let unitList = JSON.parse((await request.formData()).get("unitList")?.toString()!);
		const unitPromises = [];
		for (const unit of unitList) {
			unitPromises.push(
				prisma.unit.findFirst({
					where: {
						mulId: Number(unit)
					},
					select: {
						name: true,
						pv: true
					}
				})
			);
		}
		const resultList = await Promise.all(unitPromises);
		return { unitList: resultList };
	}
};
