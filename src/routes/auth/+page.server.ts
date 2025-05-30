import * as auth from "$lib/server/auth.js";
import { fail } from "@sveltejs/kit";
import { hash, verify } from "@node-rs/argon2";
import { prisma } from "$lib/server/prisma";

export const actions = {
	register: async (event) => {
		const { username, password, verifyPassword, email } = Object.fromEntries(await event.request.formData()) as Record<string, string>;

		if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9]+$/.test(username)) {
			return fail(400, {
				message: "Invalid username"
			});
		}
		if (typeof password !== "string" || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: "Invalid password"
			});
		}
		if (password != verifyPassword) {
			return fail(400, { message: "Passwords did not match" });
		}

		const id = auth.generateUserId();
		const hashedPassword = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		try {
			const existingUser = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] }, select: { username: true, email: true } });
			if (existingUser) {
				if ((existingUser.username = username)) {
					return fail(400, { message: "Username already in use" });
				} else {
					return fail(400, { message: "Email address already in use" });
				}
			}
			await prisma.user.create({
				data: {
					username,
					email,
					id,
					hashedPassword,
					notifications: {
						create: [
							{
								summary: "Welcome!",
								message: `I'm glad you found this site and decided to create an account. Hopefully it works well for you, and has everything you need. If you do have any issues, or some suggestions, please follow the link at the bottom that says "Page Source / Report Issues" and create a new issue. Otherwise, I hope the site helps make enjoying this game just a little bit easier for you.`,
								type: "notice",
								read: false
							}
						]
					}
				}
			});
		} catch (err) {
			console.error(err);
			return fail(400, { message: "Failed to create user" });
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		return { message: "Account created successfully", username: username };
	},
	login: async (event) => {
		const { username, password } = Object.fromEntries(await event.request.formData()) as Record<string, string>;

		const existingUser = await prisma.user.findFirst({ where: { OR: [{ username: username }, { email: username }] } });
		if (!existingUser) {
			return fail(400, { message: "Incorrect username or password" });
		}
		const validPassword = await verify(existingUser.hashedPassword ?? "", password);
		if (!validPassword) {
			return fail(400, { message: "Incorrect username or password" });
		}
		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		return { message: "Login successful", username: existingUser.username };
	},
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);
		return { message: "User logged out successfully" };
	}
};

function validateUsername(username: unknown): username is string {
	return typeof username === "string" && username.length >= 3 && username.length <= 31 && /^[a-z0-9_-]+$/.test(username);
}

function validatePassword(password: unknown): password is string {
	return typeof password === "string" && password.length >= 6 && password.length <= 255;
}
