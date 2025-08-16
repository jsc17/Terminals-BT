import { form } from "$app/server";
import { tournamentEmailTransporter } from "$lib/server/emails/mailer.server";
import { render } from "svelty-email";
import { ListSubmission } from "$lib/server/emails/templates";

export const testEmail = form(async (data) => {
	//@ts-ignore
	const emailHTML = render({ template: ListSubmission, props: { tournamentName: "test", playerName: "Test Player", playerEmail: "TestEmail", tournamentRules: "wn350v3" } });
	console.log("email sending");
	const info = await tournamentEmailTransporter.sendMail({
		from: process.env.TOURNAMENT_EMAIL_SENDER, // sender address
		to: "jonathan.colton@yahoo.com", // list of receivers
		subject: `Connection test`, // Subject line
		html: emailHTML
	});
	console.log("Message sent: %s", info.messageId);
});
