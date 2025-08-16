import nodemailer from "nodemailer";
import { render } from "svelty-email";
import { ResetPassword } from "./templates";

export const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: 587,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.EMAIL_PASSWORD
	}
});

export const transporterTest = nodemailer.createTransport({
	host: "smtp.ethereal.email",
	port: 587,
	auth: {
		user: "kaitlyn.glover57@ethereal.email",
		pass: "w4bE4cMZ5n69X63y9C"
	}
});

export const tournamentEmailTransporter = nodemailer.createTransport({
	host: process.env.TOURNAMENT_EMAIL_HOST,
	port: 587,
	auth: {
		user: process.env.TOURNAMENT_EMAIL_SENDER,
		pass: process.env.TOURNAMENT_EMAIL_PASSWORD
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
