import { query, form } from "$app/server";
import { tournamentEmailTransporter } from "$lib/server/emails/mailer.server";
import { ListSubmission } from "$lib/server/emails/templates";
import { render } from "svelty-email";
import { getEraName, getFactionName } from "$lib/remote/era-faction.remote";
import { getRulesByName } from "$lib/types/rulesets";
import * as fs from "fs/promises";
import { prisma } from "$lib/server/prisma";
import * as v from "valibot";
import { nanoid } from "nanoid";
import ListApproval from "$lib/server/emails/templates/ListApproval.svelte";

export const getApprovedTournamentList = query(async () => {
	const data = await prisma.tournament.findMany({
		where: { tournament_date: { gte: new Date() }, approved: true },
		select: { id: true, name: true, location: true, era: true, tournament_date: true, tournamentRules: true }
	});
	return { status: "success", data };
});

export const submitList = form(
	v.object({
		tournamentId: v.string(),
		playerName: v.string(),
		playerEmail: v.string(),
		listFile: v.file(),
		eraId: v.string(),
		factionId: v.string(),
		fixedData: v.string(),
		unit: v.array(v.string())
	}),
	async ({ tournamentId, playerName, playerEmail, listFile, eraId, factionId, fixedData, unit }) => {
		const tournament = await prisma.tournament.findUnique({
			where: {
				id: Number(tournamentId)
			}
		});
		if (tournament) {
			const era = await getEraName(Number(eraId));
			const faction = await getFactionName(Number(factionId));

			const pdfData = await listFile.arrayBuffer();
			const buffer = Buffer.from(pdfData);
			const base64String = buffer.toString("base64");

			const id = nanoid();
			console.log(id);
			const filename = `./files/tournament-lists/${id}.pdf`;
			await fs.writeFile(filename, buffer);
			await prisma.tournament.update({
				where: { id: Number(tournamentId) },
				data: {
					participants: {
						create: { id, name: playerName, email: playerEmail, era, faction, fixed: fixedData == "true", units: JSON.stringify(unit) }
					}
				}
			});
			const emailHTML = render({
				//@ts-ignore
				template: ListSubmission,
				props: {
					id,
					tournamentName: tournament.name,
					playerName,
					playerEmail,
					era,
					faction,
					tournamentRules: getRulesByName(tournament.tournamentRules)?.display ?? "Not Found",
					fixedData
				}
			});
			console.log("email sending");
			const info = await tournamentEmailTransporter.sendMail({
				from: process.env.TOURNAMENT_EMAIL_SENDER, // sender address
				to: tournament.email, // list of receivers
				subject: tournament.emailSubject ?? `${tournament.name} submission`, // Subject line
				html: emailHTML,
				attachments: [{ filename: listFile.name, content: base64String, encoding: "base64" }]
			});
			console.log("Message sent: %s", info.messageId);
			return { status: "success", message: "Email sent to tournament organizer" };
		} else {
			console.log("tournament not found");
			return { status: "failed", message: "Please try submitting your list again" };
		}
	}
);

export const sendApproval = query(v.string(), async (id) => {
	const participant = await prisma.participant.findUnique({ where: { id }, include: { tournament: true } });
	if (!participant || participant === null) return { status: "failed", message: "Invalid Participant Id" };

	const emailHTML = render({
		//@ts-ignore
		template: ListApproval,
		props: { tournamentName: participant.tournament.name, playerName: participant.name }
	});

	await tournamentEmailTransporter.sendMail({
		from: process.env.TOURNAMENT_EMAIL_SENDER, // sender address
		to: participant.email, // list of receivers
		subject: `${participant.tournament.name} submission`, // Subject line
		html: emailHTML
	});

	return { status: "success", message: "Approval Email Sent" };
});
