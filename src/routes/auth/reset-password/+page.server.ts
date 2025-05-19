import { prisma } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";
import { hash, verify } from "@node-rs/argon2";

export async function load({ url }) {
	const token = url.searchParams.get("token");
	let tokenIsValid = false;
	if (token) {
		const data = await prisma.resetToken.findUnique({
			where: {
				id: token,
				valid: true
			}
		});
		if (data) {
			const expiresAt = new Date(data.expiresAt);
			const now = new Date();
			if (expiresAt > now) {
				tokenIsValid = true;
			}
		}
	}
	return {
		token,
		tokenIsValid
	};
}

export const actions = {
	resetPassword: async ({ request }) => {
		const data = await request.formData();
		const newPassword = data.get("newPassword") as string;
		const token = data.get("token") as string;

		let hashedPassword = "";
		if (newPassword) {
			hashedPassword = await hash(newPassword);
		}

		if (token) {
			try {
				const existing = await prisma.resetToken.findUnique({
					where: {
						id: token
					}
				});
				if (existing) {
					await prisma.user.update({
						where: {
							id: existing.userId
						},
						data: {
							hashedPassword
						}
					});
					await prisma.resetToken.update({
						where: {
							id: existing.id
						},
						data: {
							valid: false
						}
					});
					return { message: "successfully updated password" };
				}
			} catch (error) {
				console.log(error);
			}
		} else {
			return fail(400, { message: "Token not found" });
		}
	}
};
