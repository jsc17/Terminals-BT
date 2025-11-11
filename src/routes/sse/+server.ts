import { produce } from "sveltekit-sse";
import { clients } from "$lib/server/sseClients";

export function POST({ locals }) {
	return produce(
		async function start(conn) {
			clients.set(locals.instance, conn);
			return function stop() {
				// Do your cleanup here
				clients.delete(locals.instance);
			};
		},
		{
			stop() {
				clients.delete(locals.instance);
			}
		}
	);
}
