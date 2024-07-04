import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { dev } from "$app/environment";
import { prisma } from "./prisma";
import { Google, Discord } from "arctic";

export const lucia = new Lucia(new PrismaAdapter(prisma.session, prisma.user), {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},

	getUserAttributes: (attributes) => {
		return {
			username: attributes.username
		};
	}
});

export const googleOauth = new Google(process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!, "http://localhost:5173/auth/oauth/google/callback");
export const discordOauth = new Discord(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_CLIENT_SECRET!, "http://localhost:5173/auth/oauth/discord/callback");

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

type DatabaseUserAttributes = {
	username: string;
};
