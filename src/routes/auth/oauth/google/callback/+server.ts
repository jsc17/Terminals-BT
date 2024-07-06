import { googleOauth, lucia } from "$lib/server/lucia";
import type { RequestHandler } from "@sveltejs/kit";
import { OAuth2RequestError } from "arctic";
import { prisma } from "$lib/server/prisma";
import { generateId } from "lucia";

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");

	const storedState = event.cookies.get("google_oauth_cookie");
	const storedCodeVerifier = event.cookies.get("google_oauth_code_verifier");

	if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
		return new Response(null, { status: 400 });
	}

	try {
		const tokens = await googleOauth.validateAuthorizationCode(code, storedCodeVerifier);
		const googleUserResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const googleUser = (await googleUserResponse.json()) as GoogleUser;
		if (!googleUser.email) {
			return new Response("No primary email address", { status: 400 });
		}
		if (!googleUser.email_verified) {
			return new Response("Email address not verified", { status: 400 });
		}
		//check if logging into existing user
		const existingLinkedUser = await prisma.user.findUnique({ where: { google_id: googleUser.sub } });
		if (existingLinkedUser) {
			const session = await lucia.createSession(existingLinkedUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: ".",
				...sessionCookie.attributes
			});
		} else {
			//check if user is logged in and link account
			if (event.locals.user) {
				await prisma.user.update({ where: { id: event.locals.user.id }, data: { google_id: googleUser.sub } });
			} else {
				//check if google email address exists on a user and link google sub
				const existingUser = await prisma.user.findUnique({ where: { email: googleUser.email } });
				if (existingUser) {
					if (!existingUser.google_id) {
						await prisma.user.update({
							where: {
								id: existingUser.id
							},
							data: {
								google_id: googleUser.sub
							}
						});
					}
					const session = await lucia.createSession(existingUser.id, {});
					const sessionCookie = lucia.createSessionCookie(session.id);
					event.cookies.set(sessionCookie.name, sessionCookie.value, {
						path: ".",
						...sessionCookie.attributes
					});
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
							id: generateId(15),
							email: googleUser.email,
							google_id: googleUser.sub
						}
					});
					const session = await lucia.createSession(newUser.id, {});
					const sessionCookie = lucia.createSessionCookie(session.id);
					event.cookies.set(sessionCookie.name, sessionCookie.value, {
						path: ".",
						...sessionCookie.attributes
					});
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

type GoogleUser = {
	sub: string;
	picture: string;
	email: string;
	email_verified: boolean;
};
