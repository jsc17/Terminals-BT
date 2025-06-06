import { prisma } from "$lib/server/prisma.js";
import { fail } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { sendResetEmail } from "$lib/server/emails/mailer.server";

export const actions = {
	forgotPassword: async ({ request }) => {
		const email = (await request.formData()).get("emailAddress")?.toString();

		const existingUser = await prisma.user.findUnique({
			where: {
				email
			}
		});
		if (existingUser) {
			const id = randomUUID();
			const expiresAt = new Date();

			//invalidate existing tokens
			await prisma.resetToken.updateMany({
				where: {
					userId: existingUser.id
				},
				data: {
					valid: false
				}
			});
			//create new reset token
			expiresAt.setDate(expiresAt.getDate() + 1);
			const newToken = await prisma.resetToken.create({
				data: {
					id,
					userId: existingUser.id,
					expiresAt
				}
			});
			sendResetEmail(email!, newToken.id);
			return { message: "Reset Email sent" };
		} else {
			return fail(400, { message: "A user with that email address does not exist. Please check the address you entered and try again." });
		}
	}
};
