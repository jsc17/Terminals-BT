export type Watcher = {
	clients: Set<(data: any) => void>;
	running: boolean;
	lastId: number;
};

const watchers = new Map<string, Watcher>();

export function getWatcher(matchId: string) {
	if (!watchers.has(matchId)) {
		watchers.set(matchId, {
			clients: new Set(),
			running: false,
			lastId: 0
		});
	}
	return watchers.get(matchId)!;
}

export function removeWatcher(watchId: string) {
	watchers.delete(watchId);
}
