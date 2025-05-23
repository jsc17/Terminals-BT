import { fail, redirect } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma.js";
import { hash, verify } from "@node-rs/argon2";

export const load = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, "/");
	}
	const user = await prisma.user.findUnique({ where: { username: locals.user.username } });
	const userSettings = { email: user?.email, googleLinked: user?.google_id != null, discordLinked: user?.discord_id != null };
	return userSettings;
};

export const actions = {
	changeUsername: async ({ locals, request }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		const newUsername = (await request.formData()).get("username")?.toString();
		if (!newUsername) {
			return fail(400, { message: "Unknown error. Please Try again" });
		}
		if (newUsername.length < 3 || newUsername.length > 30 || !/^[a-zA-Z0-9]+$/.test(newUsername)) {
			return fail(400, {
				message: "Invalid username"
			});
		}
		const existingUser = await prisma.user.findUnique({ where: { username: newUsername } });
		if (existingUser) {
			return fail(400, { message: "Username already in use" });
		}

		try {
			await prisma.user.update({ where: { id: locals.user.id }, data: { username: newUsername } });
		} catch (error) {
			console.log(error);
			return fail(400, { message: "Failed to update username. Please try again." });
		}
		locals.user.username = newUsername;
		return { username: newUsername };
	},
	changeEmail: async ({ locals, request }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		const newEmail = (await request.formData()).get("email")?.toString();
		if (!newEmail) {
			return fail(400, { message: "Unknown error. Please Try again" });
		}
		const existingUser = await prisma.user.findUnique({ where: { email: newEmail } });
		if (existingUser) {
			return fail(400, { message: "Email address already in use" });
		}

		try {
			await prisma.user.update({ where: { id: locals.user.id }, data: { email: newEmail } });
		} catch (error) {
			console.log(error);
			return fail(400, { message: "Failed to update email address. Please try again." });
		}
	},
	changePassword: async ({ locals, request }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		const currentPassword = (await request.formData()).get("current-password")?.toString();
		const newPassword = (await request.formData()).get("new-password")?.toString();

		if (!currentPassword || !newPassword) {
			return fail(400, { message: "Unknown error. Please Try again" });
		}

		const existingUser = await prisma.user.findUnique({ where: { id: locals.user.id } });
		if (!existingUser) {
			return fail(400, { message: "User account not found. Please try again." });
		}

		if (!(await verify(existingUser.hashedPassword ?? "", currentPassword))) {
			return fail(401, { message: "Current password is invalid" });
		}

		const hashedPassword = await hash(newPassword);

		await prisma.user.update({
			where: {
				id: locals.user.id
			},
			data: {
				hashedPassword
			}
		});
	},
	deleteUser: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}

		try {
			await prisma.user.delete({ where: { id: locals.user.id } });
		} catch (error) {
			console.log(error);
			return fail(400, { message: "Failed to delete user. Please try again" });
		}
		locals.user = null;
	}
};
