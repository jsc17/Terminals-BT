import DatabaseWorker from "./db.worker.ts?worker";
import { WorkerMessageType, type WorkerMessage } from "./types";
import { getAllUnits, getAllFactions, getAllEras, getAllFactionInEras, getAllAvailabilities } from "$lib/remote/loadData.remote";
import type { MulUnit } from "$lib/types/listTypes";
import { nanoid } from "nanoid";
import { getMULDataFromId, getResultList, getSingleUnitAvailability, getUnitAvailability, isUnitAvailable, isUnitUnique } from "$lib/remote/unit.remote";
import { getErasAndFactions } from "$lib/remote/era-faction.remote";
import { browser } from "$app/environment";

const log = (...args: any[]) => console.log("Main:", ...args);

let worker: Worker;
export const workerInitialized = Promise.withResolvers<{ status: "success" | "error"; error?: string }>();
let workerInitializing = false;
let cbMap = new Map<string, (value: any) => void>();

export async function initWorker() {
	log("initWorker");
	if (workerInitializing) return;
	workerInitializing = true;
	worker = new DatabaseWorker();
	worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
		if (e.data.type === WorkerMessageType.LOG) log(e.data.payload);

		const cb = cbMap.get(e.data.id);
		if (cb) {
			cb(e.data.payload);
			cbMap.delete(e.data.id);
		}
	};

	const initPromise = sendMessage<{ status: "success" | "error"; emptyTables?: string[]; error?: string }>({ type: WorkerMessageType.DB_INIT });
	const timeoutPromise = new Promise<{ status: "error"; error: string }>((resolve) => setTimeout(() => resolve({ status: "error", error: "timed out" }), 5000));
	await Promise.race([timeoutPromise, initPromise]).then((result) => {
		if (result.status === "error") {
			log(result.error);
			workerInitialized.resolve({ status: "error", error: result.error });
			return;
		}
		if (result.emptyTables && result.emptyTables.length > 0) initializeTables(result.emptyTables).then(() => workerInitialized.resolve({ status: "success" }));
		else workerInitialized.resolve({ status: "success" });
		log("worker initialized");
	});
}

async function sendMessage<T>(message: Omit<WorkerMessage, "id">) {
	log("sending message: " + JSON.stringify(message));
	return new Promise<T>(async (resolve) => {
		const id = nanoid();
		cbMap.set(id, resolve);
		worker.postMessage({ ...message, id });
	});
}

async function initializeTables(emptyTables: string[]) {
	const tablePromises: Promise<void>[] = [];
	for (const table of emptyTables) {
		let payloadData: any;
		switch (table) {
			case "Unit":
				payloadData = await getAllUnits();
				break;
			case "Faction":
				payloadData = await getAllFactions();
				break;
			case "Era":
				payloadData = await getAllEras();
				break;
			case "FactionInEra":
				payloadData = await getAllFactionInEras();
				break;
			case "Availability":
				payloadData = await getAllAvailabilities();
				break;
		}
		tablePromises.push(
			new Promise(async (resolve) => {
				const id = nanoid();
				const message: WorkerMessage = {
					id,
					type: WorkerMessageType.DB_INSERT,
					payload: { table, data: payloadData }
				};
				cbMap.set(id, resolve);
				while (!worker) {
					await new Promise((resolve) => setTimeout(resolve, 50));
				}
				worker.postMessage(message);
			})
		);
	}
	await Promise.all(tablePromises);
	log("Cached Data Initialized");
}

export const isLocalDBAvailable = async () => {
	if (!browser) return false;
	initWorker();
	const timeoutPromise = new Promise<{ status: "error"; error: string }>((resolve) => setTimeout(() => resolve({ status: "error", error: "timed out" }), 2000));
	const status = (await Promise.race([workerInitialized.promise, timeoutPromise])).status;
	return status === "success";
};

export async function getMULDataFromIdLocal(mulId: number) {
	if (!(await isLocalDBAvailable())) return getMULDataFromId(mulId);
	return sendMessage<MulUnit>({ type: WorkerMessageType.GET_UNIT, payload: mulId });
}
export async function isUnitAvailableLocal(data: { unitId: number; factions: number[]; eras: number[] }) {
	if (!(await isLocalDBAvailable())) return isUnitAvailable(data);
	return sendMessage<boolean>({ type: WorkerMessageType.IS_AVAILABLE, payload: data });
}
export async function isUnitUniqueLocal(data: { unitId: number; eras: number[] }) {
	if (!(await isLocalDBAvailable())) return isUnitUnique(data);
	return sendMessage<boolean>({ type: WorkerMessageType.IS_AVAILABLE, payload: { ...data, factions: [4] } });
}
export async function getUnitAvailabilityLocal(unitId: number) {
	if (!(await isLocalDBAvailable())) return getSingleUnitAvailability(unitId);
	return sendMessage<{ era: number; factions: number[] }[]>({ type: WorkerMessageType.GET_UNIT_AVAILABILITY, payload: unitId });
}
export async function getResultListLocal(data: { factions: number[]; eras: number[]; eraSearchType: "any" | "every"; factionSearchType: "any" | "every" }) {
	if (!(await isLocalDBAvailable())) return getResultList(data);
	return sendMessage<MulUnit[]>({ type: WorkerMessageType.GET_RESULT_LIST, payload: data });
}
export async function getUniqueListLocal(eras: number[]) {
	if (!(await isLocalDBAvailable())) return (await getResultList({ eras, eraSearchType: "any", factions: [4], factionSearchType: "every" })).map((u) => u.id);
	return sendMessage<number[]>({ type: WorkerMessageType.GET_UNIQUE_LIST, payload: eras });
}
export async function getErasAndFactionsLocal() {
	if (!(await isLocalDBAvailable())) return getErasAndFactions();
	return sendMessage<Map<number, { name: string; order: number; factions: { id: number; name: string }[] }>>({ type: WorkerMessageType.GET_ERAS_AND_FACTIONS });
}
