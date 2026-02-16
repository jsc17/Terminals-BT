import { toastController } from "$lib/stores";
import DatabaseWorker from "./db.worker.ts?worker";
import { WorkerMessageType, type WorkerMessage, type WorkerResponse } from "./types";
import * as v from "valibot";
import { getAllUnits } from "$lib/remote/unit.remote";

const log = (...args: any[]) => console.log("Main:", ...args);

let worker: Worker;
let cbMap = new Map<string, (value: any) => void>();

export async function initWorker() {
	log("Initializing worker");
	worker = new DatabaseWorker();
	worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
		log(e.data);
		const cb = cbMap.get(e.data.id);
		if (cb) {
			cb(e.data.result);
			cbMap.delete(e.data.id);
		}
	};

	const count = await getCount();
	log(count);
	if (count == 0) {
		toastController.addToast(`Database is empty. Initializing...`);
		const units = await getAllUnits();
		const message: WorkerMessage = {
			id: crypto.randomUUID(),
			type: WorkerMessageType.DB_INIT,
			payload: units
		};
		worker.postMessage(message);
	}
}

export function getCount() {
	return new Promise((resolve) => {
		const id = crypto.randomUUID();
		cbMap.set(id, resolve);
		const message: WorkerMessage = {
			id,
			type: WorkerMessageType.DB_COUNT
		};
		worker.postMessage(message);
	});
}

export function getUnitByMulId(mulId: number) {
	return new Promise((resolve) => {
		const id = crypto.randomUUID();
		cbMap.set(id, resolve);
		const message: WorkerMessage = {
			id,
			type: WorkerMessageType.DB_GET_UNIT,
			payload: mulId
		};
		worker.postMessage(message);
	});
}
