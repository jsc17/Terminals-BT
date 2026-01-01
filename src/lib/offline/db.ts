import type { PlayList } from "$lib/playmode/types";
import type { ListCode } from "$lib/types/listTypes";
import Dexie, { type EntityTable } from "dexie";

export const db = new Dexie("database") as Dexie & {
	previousLists: EntityTable<ListCode, "id">;
	localMatches: EntityTable<PlayList, "id">;
};

db.version(1).stores({
	previousLists: "&id, lcversion, name, eras, factions, rules, units, formations, sublists, scas, bs",
	localMatches: "&id, name, formations, units, date"
});
