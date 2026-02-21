import { toastController } from "$lib/stores";
import DatabaseWorker from "./db.worker.ts?worker";
import { WorkerMessageType, type WorkerMessage } from "./types";
import { getAllUnits, getAllFactions, getAllEras, getAllFactionInEras, getAllAvailabilities } from "$lib/remote/loadData.remote";
import type { MulUnit } from "$lib/types/listTypes";
import { nanoid } from "nanoid";

const log = (...args: any[]) => console.log("Main:", ...args);

let worker: Worker;
let workerStart: () => void;
export let workerInitialized: Promise<void> = new Promise<void>(async (resolve) => {
	workerStart = resolve;
});
let cbMap = new Map<string, (value: any) => void>();

export async function initWorker() {
	worker = new DatabaseWorker();
	worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
		if (e.data.type === WorkerMessageType.LOG) log(e.data.payload);

		const cb = cbMap.get(e.data.id);
		if (cb) {
			cb(e.data.payload);
			cbMap.delete(e.data.id);
		}
	};
	sendMessage<string[]>({ type: WorkerMessageType.DB_INIT }).then((result) => {
		if (result.length > 0) {
			const toastId = toastController.addToast(`Loading Data: ${result.join(", ")}`, 10000, false);
			initializeTables(result).then(() => {
				workerStart();
				toastController.dismissToast(toastId);
			});
		} else workerStart();
	});
}

async function sendMessage<T>(message: Omit<WorkerMessage, "id">) {
	log(message);
	return new Promise<T>(async (resolve) => {
		const id = nanoid();
		cbMap.set(id, resolve);
		if (message.type !== WorkerMessageType.DB_INIT && workerInitialized) await workerInitialized;
		worker.postMessage({ ...message, id });
	});
}

async function initializeTables(emptyTables: string[]) {
	log("Initializing Data Caches: ", emptyTables);
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

export async function getMULDataFromIdLocal(mulId: number) {
	return sendMessage<MulUnit>({ type: WorkerMessageType.GET_UNIT, payload: mulId });
}
export async function isUnitAvailableLocal(data: { unitId: number; factions: number[]; eras: number[] }) {
	return sendMessage<boolean>({ type: WorkerMessageType.IS_AVAILABLE, payload: data });
}
export async function isUnitUniqueLocal(data: { unitId: number; eras: number[] }) {
	return sendMessage<boolean>({ type: WorkerMessageType.IS_AVAILABLE, payload: { ...data, factions: [4] } });
}
export async function getUnitAvailabilityLocal(unitId: number) {
	return sendMessage<{ era: number; factions: number[] }[]>({ type: WorkerMessageType.GET_UNIT_AVAILABILITY, payload: unitId });
}
export async function getResultListLocal(data: { factions: number[]; eras: number[]; eraSearchType: "any" | "every"; factionSearchType: "any" | "every" }) {
	return sendMessage<MulUnit[]>({ type: WorkerMessageType.GET_RESULT_LIST, payload: data });
}
export async function getUniqueListLocal(eras: number[]) {
	return sendMessage<number[]>({ type: WorkerMessageType.GET_UNIQUE_LIST, payload: eras });
}
