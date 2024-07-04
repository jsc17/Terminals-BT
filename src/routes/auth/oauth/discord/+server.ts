import { discordOauth } from "$lib/server/lucia";
import { redirect, type RequestEvent } from "@sveltejs/kit";
import { generateState, generateCodeVerifier } from "arctic";
import { dev } from "$app/environment";

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const url = await discordOauth.createAuthorizationURL(state, { scopes: ["identify", "email"] });

	event.cookies.set("discord_oauth_state", state, { path: "/", secure: !dev, httpOnly: true, maxAge: 60 * 10, sameSite: "lax" });

	redirect(302, url.toString());
}
