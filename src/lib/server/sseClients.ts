import { type Connection } from "sveltekit-sse";

export const clients = new Map<string, Connection>();
