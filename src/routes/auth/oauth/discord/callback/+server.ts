import { discordOauth, lucia } from "$lib/server/lucia";
import type { RequestHandler } from "@sveltejs/kit";
import { OAuth2RequestError } from "arctic";
import { prisma } from "$lib/server/prisma";
import { generateId } from "lucia";

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");

	const storedState = event.cookies.get("discord_oauth_state");

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, { status: 400 });
	}

	try {
		const tokens = await discordOauth.validateAuthorizationCode(code);
		const discordResponse = await fetch("https://discord.com/api/users/@me", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const discordUser = (await discordResponse.json()) as DiscordUser;
		if (!discordUser.email) {
			return new Response("No primary email address", { status: 400 });
		}
		if (!discordUser.verified) {
			return new Response("Email address not verified", { status: 400 });
		}

		const existingUser = await prisma.user.findUnique({
			where: {
				email: discordUser.email
			}
		});
		if (existingUser) {
			console.log("user exists");
			if (!existingUser.google_id) {
				await prisma.user.update({
					where: {
						id: existingUser.id
					},
					data: {
						discord_id: discordUser.id
					}
				});
			}
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: ".",
				...sessionCookie.attributes
			});
		} else {
			const newUser = await prisma.user.create({
				data: {
					username: discordUser.username,
					id: generateId(15),
					email: discordUser.email,
					discord_id: discordUser.id
				}
			});
			const session = await lucia.createSession(newUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: ".",
				...sessionCookie.attributes
			});
		}
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	} catch (error) {
		if (error instanceof OAuth2RequestError) {
			return new Response(null, { status: 400 });
		} else {
			return new Response(null, { status: 500 });
		}
	}
};

type DiscordUser = {
	id: string;
	email: string;
	verified: boolean;
	username: string;
};
