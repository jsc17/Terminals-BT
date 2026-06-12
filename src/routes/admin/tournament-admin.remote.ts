import { query, command } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import { render } from "svelty-email";
import { tournamentEmailTransporter } from "$lib/server/emails/mailer.server";
import type { Tournament } from "$lib/generated/prisma/browser";
import TournamentApprovalConfirmation from "$lib/server/emails/templates/TournamentApprovalConfirmation.svelte";
import { env } from "$env/dynamic/private";

export const getPendingTournaments = query(async () => {
	return await prisma.tournament.findMany({ where: { approved: false } });
});

export const approveTournament = command(v.object({ tournamentId: v.number() }), async ({ tournamentId }) => {
	const tournament: Tournament = await prisma.tournament.update({ where: { id: tournamentId }, data: { approved: true } });
	if (!tournament) {
		console.log("Tournament Not found");
		return;
	}
	const confirmationHTML = render({
		//@ts-ignore
		template: TournamentApprovalConfirmation,
		props: { tournament }
	});
	tournamentEmailTransporter.sendMail({
		from: env.TOURNAMENT_EMAIL_SENDER, // sender address
		to: tournament.email, // list of receivers
		subject: `${tournament.name} submission confirmation`, // Subject line
		html: confirmationHTML
	});
});
