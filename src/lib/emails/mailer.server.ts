import nodemailer from "nodemailer";
import { render } from "svelty-email";
import ResetPassword from "./ResetPassword.svelte";
import NewTournament from "./NewTournament.svelte";
import ListSubmission from "./ListSubmission.svelte";
import { prisma } from "$lib/server/prisma";

export const transporter = nodemailer.createTransport({
	host: "smtp.ethereal.email",
	// host: "smtp.porkbun.com",
	port: 587,
	auth: {
		user: "vilma.marquardt@ethereal.email",
		pass: "TRudc23e22uAjJDyAB"
		// user: EMAIL,
		// pass: EMAIL_PASSWORD
	}
});

export async function sendResetEmail(email: string, token: string) {
	const emailHTML = render({ template: ResetPassword, props: { token } });
	const info = await transporter.sendMail({
		from: "support@terminl.xyz", // sender address
		to: email, // list of receivers
		subject: "Terminl.xyz Password Reset Link", // Subject line
		html: emailHTML
	});
	console.log("Message sent: %s", info.messageId);
}

export async function sendNewTournamentEmail(email: string, user: string, name: string, date: string, era: string, linkId: string) {
	const link = `https://bt.terminl.xyz/350validation?id=${linkId}`;
	const emailHTML = render({ template: NewTournament, props: { user, date, era, link, name } });
	const info = await transporter.sendMail({
		from: "support@terminl.xyz", // sender address
		to: email, // list of receivers
		subject: "New Tournament Created", // Subject line
		html: emailHTML
	});
	console.log("Message sent: %s", info.messageId);
}

export async function sendListSubmissionEmail(email: string, tournamentId: number, playerName: string, existing: boolean) {
	console.log("List submitted");
	const tournament = await prisma.tournament.findUnique({
		where: {
			id: tournamentId
		}
	});
	console.log("tournament found");
	if (tournament) {
		const emailHTML = render({ template: ListSubmission, props: { organizer: tournament.organizer, tournamentName: tournament.name, playerName, existing } });
		const info = await transporter.sendMail({
			from: "support@terminl.xyz", // sender address
			to: tournament.email, // list of receivers
			subject: `New list submitted for ${tournament.name}`, // Subject line
			html: emailHTML
		});
		console.log("Message sent: %s", info.messageId);
	}
}
