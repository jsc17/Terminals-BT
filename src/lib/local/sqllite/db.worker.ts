import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { WorkerMessageType, type WorkerMessage, type WorkerResponse } from "./types";
import type { MulUnit } from "$lib/types/listTypes";
import { handleParse } from "$lib/utilities/abilityUtilities";
import { convertUnitDataToMulUnit } from "$lib/utilities/unitData";

const log = (...args: any[]) => console.log("Worker:", ...args);
const error = (...args: any[]) => console.error("Worker:", ...args);

let db: any;

async function initDb() {
	try {
		// @ts-ignore
		const sqlite3 = await sqlite3InitModule({
			print: log,
			printErr: error,
			// @ts-ignore
			locateFile: (file: string) => `/sqlite3.wasm`
		});

		if ("opfs" in sqlite3) {
			db = new sqlite3.oo1.OpfsDb("/mydb.sqlite3");
			db.exec(
				'CREATE TABLE IF NOT EXISTS Unit (id INTEGER PRIMARY KEY, mulId INTEGER, name TEXT, "group" TEXT, class TEXT, variant TEXT, technology TEXT, rules TEXT, date_introduced INTEGER, role TEXT, type TEXT, subtype TEXT, size INTEGER, move TEXT, tmm INTEGER, armor INTEGER, structure INTEGER, threshold INTEGER, damage_s INTEGER, damage_s_min BOOLEAN, damage_m INTEGER, damage_m_min BOOLEAN, damage_l INTEGER, damage_l_min BOOLEAN, damage_e INTEGER, damage_e_min BOOLEAN, overheat INTEGER, pv INTEGER, abilities TEXT, tonnage INTEGER, image_url TEXT)'
			);
		} else {
			log("Could not create OPFS database");
		}
	} catch (err: any) {
		error("Initialization error:", err.name, err.message);
	}
}

initDb();

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
	if (!db) await initDb();
	// log(e.data);
	switch (e.data.type) {
		case WorkerMessageType.DB_INIT:
			const units = e.data.payload;
			db.transaction(() => {
				const columns = Object.keys(units[0]);
				const placeholders = columns.map(() => "?").join(", ");
				const sql = `INSERT INTO Unit (${columns.join(", ").replace("group", '"group"')}) VALUES (${placeholders})`;
				const stmt = db.prepare(sql);
				for (const unit of units) {
					stmt.bind(columns.map((col) => unit[col]));
					stmt.step();
					stmt.reset();
				}
				stmt.finalize();
			});
			break;
		case WorkerMessageType.DB_COUNT:
			const result = db.exec(`SELECT COUNT(*) FROM Unit`, { returnValue: "resultRows" })[0][0];
			self.postMessage({ id: e.data.id, result });
			break;
		case WorkerMessageType.DB_GET_UNIT:
			const unitData = db.exec(`SELECT * FROM Unit WHERE mulId = ${e.data.payload}`, { rowMode: "object", returnValue: "resultRows" })[0];
			const mulUnit = convertUnitDataToMulUnit(unitData);
			self.postMessage({ id: e.data.id, result: mulUnit });
			break;
		default:
			log(`Unknown message type: ${e.data.type}`);
	}
};
