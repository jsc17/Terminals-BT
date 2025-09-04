import { query, form, getRequestEvent, command } from "$app/server";
import { prisma } from "$lib/server/prisma";
import * as fs from "fs/promises";
import * as v from "valibot";
import { calculateTournamentStatistics } from "./statistics";
import { tournamentEmailTransporter } from "$lib/server/emails/mailer.server";

export const createTournament = form(async (data) => {
	let { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "user is not logged in" };

	try {
		const name = data.get("tournament-name")!.toString();
		const date = new Date(data.get("tournament-date")!.toString());
		const email = data.get("tournament-email")!.toString();
		const era = data.get("tournament-era")?.toString();
		const rules = data.get("tournament-rules")!.toString();
		const emailSubject = data.get("tournament-email-subject")?.toString();
		const location = data.get("tournament-location")?.toString();
		const message = data.get("tournament-message")!.toString();

		const tournament = await prisma.tournament.create({
			data: {
				user: { connect: { id: locals.user.id } },
				name,
				email,
				location,
				emailSubject,
				tournament_date: date,
				era: era ? Number(era) : undefined,
				tournamentRules: rules,
				approvalMessage: message
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
});

export const getUsersTournamentList = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "User not logged in" };

	const data = await prisma.tournament.findMany({
		where: { userId: locals.user.id, tournament_date: { gte: new Date() } },
		select: { id: true, name: true, location: true, era: true, tournament_date: true, tournamentRules: true }
	});
	return { status: "success", data };
});

export const deleteParticipant = command(v.number(), async (participantId) => {
	await prisma.participant.delete({ where: { id: participantId } });
});

export const getParticipantsGameList = query(v.number(), async (participantId) => {
	const participant = await prisma.participant.findUnique({ where: { id: participantId } });
	if (participant) {
		const file = await fs.readFile(participant?.listName);
		return { status: "success", data: file };
	}
	return { status: "failed", message: "List not found" };
});

export const getTournamentStatistics = query(v.number(), async (tournamentId) => {
	const participants = await prisma.participant.findMany({ where: { tournamentId }, select: { name: true, units: true, era: true, faction: true } });
	const stats = await calculateTournamentStatistics(participants);
	return { status: "success", data: stats };
});
