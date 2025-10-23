import { query, form, getRequestEvent, command } from "$app/server";
import { prisma } from "$lib/server/prisma";
import * as fs from "fs/promises";
import * as v from "valibot";
import { calculateTournamentStatistics } from "./statistics";
import { tournamentEmailTransporter } from "$lib/server/emails/mailer.server";

export const createTournament = form(
	v.object({
		tournamentName: v.string(),
		tournamentDate: v.string(),
		tournamentEmail: v.string(),
		tournamentEra: v.optional(v.string()),
		tournamentRules: v.string(),
		tournamentEmailSubject: v.optional(v.string()),
		tournamentLocation: v.optional(v.string()),
		tournamentMessage: v.string()
	}),
	async (data) => {
		let { locals } = getRequestEvent();
		if (!locals.user) return { status: "failed", message: "user is not logged in" };

		try {
			const tournament = await prisma.tournament.create({
				data: {
					user: { connect: { id: locals.user.id } },
					name: data.tournamentName,
					email: data.tournamentEmail,
					location: data.tournamentLocation,
					emailSubject: data.tournamentEmailSubject,
					tournament_date: new Date(data.tournamentDate),
					era: data.tournamentEra ? Number(data.tournamentEra) : undefined,
					tournamentRules: data.tournamentRules,
					approvalMessage: data.tournamentMessage
				}
			});

			await tournamentEmailTransporter.sendMail({
				from: process.env.TOURNAMENT_EMAIL_SENDER, // sender address
				to: "jonathan.colton@yahoo.com", // list of receivers
				subject: `New Tournament pending approval`, // Subject line
				html: `<p>A new tournament has been created: ${tournament.id}</p>`
			});

			return { status: "success", data: tournament.id };
		} catch (error) {
			return { status: "failed", message: error };
		}
	}
);

export const getUsersTournamentList = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "User not logged in" };

	const data = await prisma.tournament.findMany({
		where: { userId: locals.user.id, tournament_date: { gte: new Date() } },
		select: { id: true, name: true, location: true, era: true, tournament_date: true, tournamentRules: true }
	});
	return { status: "success", data };
});

export const deleteParticipant = command(v.string(), async (participantId) => {
	await prisma.participant.delete({ where: { id: participantId } });
});

export const getParticipantsGameList = query(v.string(), async (participantId) => {
	const participant = await prisma.participant.findUnique({ where: { id: participantId } });
	if (participant) {
		const file = await fs.readFile(`./files/tournament-lists/${participant.id}.pdf`);
		return { status: "success", data: file };
	}
	return { status: "failed", message: "List not found" };
});

export const getTournamentStatistics = query(v.number(), async (tournamentId) => {
	const participants = await prisma.participant.findMany({ where: { tournamentId }, select: { name: true, units: true, era: true, faction: true } });
	const stats = await calculateTournamentStatistics(participants);
	return { status: "success", data: stats };
});
