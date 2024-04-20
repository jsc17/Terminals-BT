import { lucia } from "$lib/server/lucia";
import { fail } from "@sveltejs/kit";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { prisma } from "$lib/server/prisma";

export const actions = {
	register: async ({ request, cookies }) => {
		const { username, password, email } = Object.fromEntries(await request.formData()) as Record<string, string>;

		if (username.length < 3 || username.length > 31 || !/^[a-z0-9_-]+$/.test(username)) {
			return fail(400, {
				message: "Invalid username"
			});
		}
		if (typeof password !== "string" || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: "Invalid password"
			});
		}

		const id = generateId(15);
		const hashedPassword = await new Argon2id().hash(password);

		try {
			await prisma.user.create({
				data: {
					username,
					email,
					id,
					hashedPassword
				}
			});
		} catch (err) {
			console.error(err);
			return fail(400, { message: "Failed to create user" });
		}

		const session = await lucia.createSession(id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});

		return { message: "Account created successfully", username: username };
	},
	login: async ({ request, cookies }) => {
		const { username, password } = Object.fromEntries(await request.formData()) as Record<string, string>;

		const existingUser = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
		if (!existingUser) {
			return fail(400, { message: "Incorrect username or password" });
		}
		const validPassword = await new Argon2id().verify(existingUser.hashedPassword, password);
		if (!validPassword) {
			return fail(400, { message: "Incorrect username or password" });
		}
		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
		return { message: "Login successful", username: existingUser.username };
	},
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await lucia.invalidateSession(event.locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
	}
};
