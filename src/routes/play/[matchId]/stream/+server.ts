import type { RequestHandler } from "./$types";
import { getWatcher } from "$lib/server/matchSSE/watchers.server";
import { startWatcher } from "$lib/server/matchSSE/watchMessages.server";

export const GET: RequestHandler = ({ params }) => {
	const matchId = Number(params.matchId);
	const watcher = getWatcher(matchId);
	let send: ((data: any) => void) | null = null;

	const stream = new ReadableStream({
		async start(controller) {
			send = (data: any) => {
				controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
			};

			watcher.clients.add(send);
			startWatcher(matchId);
			controller.enqueue(`event: connected\ndata: "${matchId}"\n\n`);
		},
		cancel() {
			if (send) {
				watcher.clients.delete(send);
				console.log(`Client disconnected from ${matchId}`);
			}
		}
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive"
		}
	});
};
