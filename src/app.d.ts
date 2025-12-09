// See https://kit.svelte.dev/docs/types#app

import type { PrismaClient } from "$lib/generated/prisma/browser";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import("$lib/server/auth/auth").SessionValidationResult["user"];
			session: import("$lib/server/auth/auth").SessionValidationResult["session"];
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	var prisma: PrismaClient;
}

export {};
