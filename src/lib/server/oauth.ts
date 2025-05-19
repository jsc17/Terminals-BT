import { Google, Discord } from "arctic";
import { env } from "$env/dynamic/private";

export const google = new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_CALLBACK);

export const discord = new Discord(env.DISCORD_CLIENT_ID, env.DISCORD_CLIENT_SECRET, env.DISCORD_CALLBACK);
