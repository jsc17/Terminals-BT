import { redirect, type RequestEvent } from "@sveltejs/kit";
import { generateState, generateCodeVerifier } from "arctic";
import { discord } from "$lib/server/auth/oauth";
import { dev } from "$app/environment";

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = discord.createAuthorizationURL(state, codeVerifier, ["identify", "email"]);

	event.cookies.set("discord_oauth_state", state, { path: "/", secure: !dev, httpOnly: true, maxAge: 60 * 10, sameSite: "lax" });
	event.cookies.set("discord_oauth_code_verifier", codeVerifier, { path: "/", secure: !dev, httpOnly: true, maxAge: 60 * 10, sameSite: "lax" });

	redirect(302, url.toString());
}
