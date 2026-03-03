import type { MatchLog } from "$lib/generated/prisma/browser";
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
		} else {
			const lastMessage = await prisma.matchLog.findMany({ where: { matchId }, orderBy: { updated_at: "desc" }, take: 1 });
			if (lastMessage) {
				const heartbeat: MatchLog = {
					id: lastMessage[0].id,
					type: "HEARTBEAT",
					matchId,
					submitterId: -1,
					unitId: null,
					updated_at: new Date(),
					round: -1,
					applied: false,
					details: null
				};
				for (const send of watcher.clients) {
					send(heartbeat);
				}
			}
		}
		lastCheck = new Date();
		await new Promise((resolve) => setTimeout(resolve, intervalMs));
	}
}
