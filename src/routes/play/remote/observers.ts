import { command, query } from "$app/server";
import { prisma } from "$lib/server/prisma";
import * as v from "valibot";

// export const getObserverCount = query(v.string(), async (matchId) => {
// 	return observerCounts.get(matchId);
// });
// export const connectToMatch = command(v.string(), async (matchId) => {
// 	if (!observerCounts.has(matchId)) observerCounts.set(matchId, 0);
// 	observerCounts.set(matchId, (observerCounts.get(matchId) ?? 0) + 1);
// 	await getObserverCount(matchId).refresh();
// });
// export const disconnectFromMatch = command(v.string(), async (matchId) => {
// 	const currentCount = observerCounts.get(matchId) ?? 0;
// 	if (currentCount > 0) observerCounts.set(matchId, currentCount - 1);
// 	await getObserverCount(matchId).refresh();
// });
