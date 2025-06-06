import { fail, redirect } from "@sveltejs/kit";
import { validateSessionToken, setSessionTokenCookie, deleteSessionTokenCookie, sessionCookieName } from "$lib/server/auth/auth";
import { prisma } from "$lib/server/prisma";

export const handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(sessionCookieName) ?? null;

	if (sessionToken === null) {
		event.locals.session = null;
		event.locals.user = null;
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(sessionToken);

	if (session) {
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};
