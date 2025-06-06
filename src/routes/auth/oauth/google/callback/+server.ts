import type { RequestHandler, RequestEvent } from "@sveltejs/kit";
import { generateSessionToken, createSession, setSessionTokenCookie, generateUserId } from "$lib/server/auth/auth";
import { google } from "$lib/server/auth/oauth";
import { decodeIdToken, type OAuth2Tokens } from "arctic";
import { prisma } from "$lib/server/prisma";

export const GET: RequestHandler = async (event: RequestEvent) => {
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");
	const storedState = event.cookies.get("google_oauth_cookie") ?? null;
	const storedCodeVerifier = event.cookies.get("google_oauth_code_verifier") ?? null;

	if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
		return new Response(null, { status: 400 });
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
	} catch (error) {
		return new Response(null, { status: 400 });
	}
	const claims: any = decodeIdToken(tokens.idToken());

	const { email, email_verified, sub } = claims;

	if (!email) {
		return new Response("No primary email address", { status: 400 });
	}
	if (!email_verified) {
		return new Response("Email address not verified", { status: 400 });
	}
	// 	//check if logging into existing user
	const existingLinkedUser = await prisma.user.findUnique({ where: { google_id: sub } });
	if (existingLinkedUser) {
		const SessionToken = generateSessionToken();
		const session = await createSession(SessionToken, existingLinkedUser.id);
		setSessionTokenCookie(event, SessionToken, session.expiresAt);
		return new Response(null, { status: 302, headers: { Location: "/" } });
	} else {
		// 		//check if user is logged in and link account
		if (event.locals.user) {
			await prisma.user.update({ where: { id: event.locals.user.id }, data: { google_id: sub } });
		} else {
			// 			//check if google email address exists on a user and link google sub
			const existingUser = await prisma.user.findUnique({ where: { email } });
			if (existingUser) {
				if (!existingUser.google_id) {
					await prisma.user.update({
						where: {
							id: existingUser.id
						},
						data: {
							google_id: sub
						}
					});
				}
				const SessionToken = generateSessionToken();
				const session = await createSession(SessionToken, existingUser.id);
				setSessionTokenCookie(event, SessionToken, session.expiresAt);
				//create user with google email address, google oauth sub, random username, and no password
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
						email: email,
						google_id: sub
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
};

type GoogleUser = {
	sub: string;
	picture: string;
	email: string;
	email_verified: boolean;
};
