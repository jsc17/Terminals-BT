import { toastController } from "$lib/stores";
import DatabaseWorker from "./db.worker.ts?worker";
import { WorkerMessageType, type WorkerMessage } from "./types";
import * as v from "valibot";
import { getAllUnits, getAllFactions, getAllEras, getAllFactionInEras, getAllAvailabilities } from "$lib/remote/loadData.remote";
import type { MulUnit } from "$lib/types/listTypes";
import { nanoid } from "nanoid";

const log = (...args: any[]) => console.log("Main:", ...args);

let worker: Worker;
let workerInitialized = false;
let cbMap = new Map<string, (value: any) => void>();

export async function initWorker() {
	worker = new DatabaseWorker();
	worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
		// log(e.data);
		const cb = cbMap.get(e.data.id);
		if (cb) {
			cb(e.data.payload);
			cbMap.delete(e.data.id);
		}
	};

	sendMessage<string[]>({ type: WorkerMessageType.DB_INIT }).then((result) => {
		if (result.length > 0) initializeTables(result).then(() => (workerInitialized = true));
		else workerInitialized = true;
	});
}

async function sendMessage<T>(message: Omit<WorkerMessage, "id">) {
	return new Promise<T>(async (resolve) => {
		const id = nanoid();
		cbMap.set(id, resolve);
		while (!workerInitialized && message.type !== WorkerMessageType.DB_INIT) {
			await new Promise((resolve) => setTimeout(resolve, 1500));
		}
		worker.postMessage({ ...message, id });
	});
}

async function initializeTables(emptyTables: string[]) {
	log("Empty Table", emptyTables);
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
		await new Promise(async (resolve) => {
			const id = nanoid();
			const message: WorkerMessage = {
				id,
				type: WorkerMessageType.DB_INIT,
				payload: { table, data: payloadData }
			};
			cbMap.set(id, resolve);
			while (!worker) {
				await new Promise((resolve) => setTimeout(resolve, 50));
			}
			worker.postMessage(message);
		});
	}
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
