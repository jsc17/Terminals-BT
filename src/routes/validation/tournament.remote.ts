import { query, form } from "$app/server";
import { tournamentEmailTransporter } from "$lib/server/emails/mailer.server";
import { ListSubmission } from "$lib/server/emails/templates";
import { render } from "svelty-email";
import { getEraName, getFactionName } from "$lib/remote/era-faction.remote";
import { getRulesByName } from "$lib/types/rulesets";
import * as fs from "fs/promises";
import { prisma } from "$lib/server/prisma";

export const getApprovedTournamentList = query(async () => {
	const data = await prisma.tournament.findMany({
		where: { tournament_date: { gte: new Date() }, approved: true },
		select: { id: true, name: true, location: true, era: true, tournament_date: true, tournamentRules: true }
	});
	return { status: "success", data };
});

export const submitList = form(async (data) => {
	const tournamentId = data.get("tournamentId");
	const playerName = data.get("playerName")?.toString();
	if (!playerName) return { status: "failed", message: "Error with player name. Please try submitting your list again" };
	const playerEmail = data.get("playerEmail")?.toString();
	if (!playerEmail) return { status: "failed", message: "Error with player name. Please try submitting your list again" };

	const pdf = data.get("listFile") as File;
	const era = Number(data.get("era")?.toString());
	const faction = Number(data.get("faction")?.toString());
	const fixed = data.get("fixedData")?.toString() == "true";
	const unitList = data.getAll("unit").map((u) => u.toString());

	const pdfData = await pdf.arrayBuffer();
	const buffer = Buffer.from(pdfData);
	const base64String = buffer.toString("base64");

	const tournament = await prisma.tournament.findUnique({
		where: {
			id: Number(tournamentId)
		}
	});
	if (tournament) {
		const filename = `./files/tournament-lists/${crypto.randomUUID()}.pdf`;
		await fs.writeFile(filename, buffer);
		await prisma.tournament.update({
			where: { id: Number(tournamentId) },
			data: { participants: { create: { name: playerName, email: playerEmail, listName: filename, era, faction, fixed, units: JSON.stringify(unitList) } } }
		});
		const emailHTML = render({
			//@ts-ignore
			template: ListSubmission,
			props: {
				tournamentName: tournament.name,
				playerName,
				playerEmail,
				era: await getEraName(era),
				faction: await getFactionName(faction),
				tournamentRules: getRulesByName(tournament.tournamentRules)?.display ?? "Not Found",
				fixed
			}
		});
		console.log("email sending");
		const info = await tournamentEmailTransporter.sendMail({
			from: process.env.TOURNAMENT_EMAIL_SENDER, // sender address
			to: tournament.email, // list of receivers
			subject: tournament.emailSubject ?? `${tournament.name} submission`, // Subject line
			html: emailHTML,
			attachments: [{ filename: pdf.name, content: base64String, encoding: "base64" }]
		});
		console.log("Message sent: %s", info.messageId);
		return { status: "success", message: "Email sent to tournament organizer" };
	} else {
		console.log("tournament not found");
		return { status: "failed", message: "Please try submitting your list again" };
	}
});
