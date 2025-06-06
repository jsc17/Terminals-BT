import type { RequestHandler } from "@sveltejs/kit";
import { OAuth2RequestError } from "arctic";
import { generateSessionToken, createSession, setSessionTokenCookie, generateUserId } from "$lib/server/auth/auth";
import { prisma } from "$lib/server/prisma";
import { discord } from "$lib/server/auth/oauth";

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");

	const storedState = event.cookies.get("discord_oauth_state");
	const storedCodeVerifier = event.cookies.get("discord_oauth_code_verifier") ?? null;

	if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
		return new Response(null, { status: 400 });
	}

	try {
		const tokens = await discord.validateAuthorizationCode(code, storedCodeVerifier);

		const discordResponse = await fetch("https://discord.com/api/users/@me", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`
			}
		});
		const discordUser = (await discordResponse.json()) as DiscordUser;
		if (!discordUser.email) {
			return new Response("No primary email address", { status: 400 });
		}
		if (!discordUser.verified) {
			return new Response("Email address not verified", { status: 400 });
		}

		//check if logging into existing user
		const existingLinkedUser = await prisma.user.findUnique({ where: { discord_id: discordUser.id } });
		if (existingLinkedUser) {
			const SessionToken = generateSessionToken();
			const session = await createSession(SessionToken, existingLinkedUser.id);
			setSessionTokenCookie(event, SessionToken, session.expiresAt);
			return new Response(null, { status: 302, headers: { Location: "/" } });
		} else {
			//check if user is logged in and link account
			if (event.locals.user) {
				await prisma.user.update({ where: { id: event.locals.user.id }, data: { discord_id: discordUser.id } });
			} else {
				//check if discord email address exists on a user and link discord id
				const existingUser = await prisma.user.findUnique({ where: { email: discordUser.email } });
				if (existingUser) {
					if (!existingUser.discord_id) {
						await prisma.user.update({
							where: {
								id: existingUser.id
							},
							data: {
								discord_id: discordUser.id
							}
						});
					}
					const SessionToken = generateSessionToken();
					const session = await createSession(SessionToken, existingUser.id);
					setSessionTokenCookie(event, SessionToken, session.expiresAt);
					//create user with discord email address, discord oauth id, random username, and no password
				} else {
					let username = "";
					while (username == "") {
						username = `user${Math.floor(Math.random() * 90000) + 10000}`;
						const existingName = await prisma.user.findUnique({ where: { username } });
						if (existingName) {
							username = "";
						}
					}
					const newUser = await prisma.user.create({
						data: {
							username,
							id: generateUserId(),
							email: discordUser.email,
							discord_id: discordUser.id
						}
					});
					const SessionToken = generateSessionToken();
					const session = await createSession(SessionToken, newUser.id);
					setSessionTokenCookie(event, SessionToken, session.expiresAt);
				}
			}
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
