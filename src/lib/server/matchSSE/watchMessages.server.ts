import { prisma } from "$lib/server/prisma";
import { getWatcher, removeWatcher } from "./watchers.server";

export async function startWatcher(matchId: string, intervalMs = 1000) {
	const watcher = getWatcher(matchId);

	if (watcher.running) return;
	watcher.running = true;
	let lastCheck = new Date(); // cursor timestamp

	console.log(`Watcher for "${matchId}" started`);

	while (true) {
		if (watcher.clients.size == 0) {
			console.log(`Watcher for "${matchId}" stopping (no clients).`);
			watcher.running = false;
			removeWatcher(matchId);
			return;
		}

		const messages = await prisma.matchLog.findMany({ where: { matchId, updated_at: { gte: lastCheck } } });

		if (messages.length > 0) {
			for (const message of messages) {
				for (const send of watcher.clients) {
					send(message);
				}
			}
		}
		lastCheck = new Date();
		await new Promise((resolve) => setTimeout(resolve, intervalMs));
	}
}
