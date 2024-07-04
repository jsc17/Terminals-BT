import { googleOauth } from "$lib/server/lucia";
import { redirect, type RequestEvent } from "@sveltejs/kit";
import { generateState, generateCodeVerifier } from "arctic";
import { dev } from "$app/environment";

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = await googleOauth.createAuthorizationURL(state, codeVerifier, { scopes: ["email"] });

	event.cookies.set("google_oauth_cookie", state, { path: "/", secure: !dev, httpOnly: true, maxAge: 60 * 10, sameSite: "lax" });
	event.cookies.set("google_oauth_code_verifier", codeVerifier, { path: "/", secure: !dev, httpOnly: true, maxAge: 60 * 10, sameSite: "lax" });

	redirect(302, url.toString());
}
