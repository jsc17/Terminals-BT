import nodemailer from "nodemailer";
import { render } from "svelty-email";
import { ResetPassword } from "./templates";
import { env } from "$env/dynamic/private";

export const transporter = nodemailer.createTransport({
	host: env.EMAIL_HOST,
	port: 587,
	auth: {
		user: env.EMAIL,
		pass: env.EMAIL_PASSWORD
	}
});

export const tournamentEmailTransporter = nodemailer.createTransport({
	host: env.TOURNAMENT_EMAIL_HOST,
	port: 587,
	auth: {
		user: env.TOURNAMENT_EMAIL_SENDER,
		pass: env.TOURNAMENT_EMAIL_PASSWORD
	}
});

export async function sendResetEmail(email: string, token: string) {
	//@ts-ignore
	const emailHTML = render({ template: ResetPassword, props: { token } });
	const info = await transporter.sendMail({
		from: "support@terminl.xyz", // sender address
		to: email, // list of receivers
		subject: "Terminl.xyz Password Reset Link", // Subject line
		html: emailHTML
	});
	console.log("Message sent: %s", info.messageId);
}
