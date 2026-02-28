import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { WorkerMessageType, type WorkerMessage } from "./types";
import { convertUnitDataToMulUnit } from "$lib/utilities/unitData";

const log = (...args: any[]) => console.log("Worker:", ...args);
const error = (...args: any[]) => console.error("Worker:", ...args);

let db: any;
let dbStarted = false;

async function initDb(id: string) {
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
			db.exec("PRAGMA foreign_keys = ON");
			db.exec(
				'CREATE TABLE IF NOT EXISTS Unit (id INTEGER PRIMARY KEY, mulId INTEGER, name TEXT, "group" TEXT, class TEXT, variant TEXT, technology TEXT, rules TEXT, date_introduced INTEGER, role TEXT, type TEXT, subtype TEXT, size INTEGER, move TEXT, tmm INTEGER, armor INTEGER, structure INTEGER, threshold INTEGER, damage_s INTEGER, damage_s_min BOOLEAN, damage_m INTEGER, damage_m_min BOOLEAN, damage_l INTEGER, damage_l_min BOOLEAN, damage_e INTEGER, damage_e_min BOOLEAN, overheat INTEGER, pv INTEGER, abilities TEXT, tonnage INTEGER, image_url TEXT)'
			);
			db.exec("CREATE TABLE IF NOT EXISTS Faction (id INTEGER PRIMARY KEY, name TEXT)");
			db.exec('CREATE TABLE IF NOT EXISTS Era (id INTEGER PRIMARY KEY, name TEXT, "order" INTEGER DEFAULT 0)');
			db.exec(
				"CREATE TABLE IF NOT EXISTS FactionInEra (eraId INTEGER, factionId INTEGER, general INTEGER, updated INTEGER DEFAULT (strftime('%s', 'now')), PRIMARY KEY (eraId, factionId), FOREIGN KEY(eraId) REFERENCES Era(id), FOREIGN KEY(factionId) REFERENCES Faction(id))"
			);
			db.exec(
				"CREATE TABLE IF NOT EXISTS Availability (unitId INTEGER, faction INTEGER, era INTEGER, PRIMARY KEY (unitId, faction, era), FOREIGN KEY(unitId) REFERENCES Unit(id), FOREIGN KEY(faction, era) REFERENCES FactionInEra(factionId, eraId))"
			);
			db.exec(`CREATE INDEX IF NOT EXISTS idx_availability_lookup  ON availability(unitId, era, faction);`);
			let emptyTables: string[] = [];

			for (const table of ["Unit", "Faction", "Era", "FactionInEra", "Availability"]) {
				if (db.exec(`SELECT COUNT(*) FROM ${table}`, { returnValue: "resultRows" })[0][0] == 0) emptyTables.push(table);
			}
			postMessage({ id, type: WorkerMessageType.DB_INIT_RESPONSE, payload: { initialized: true, emptyTables } });
			dbStarted = true;
		} else {
			postMessage({ id, type: WorkerMessageType.DB_INIT_RESPONSE, payload: { initialized: false, error: "Could not create OPFS database" } });
			log("Could not create OPFS database");
		}
	} catch (err: any) {
		error("Initialization error:", err.name, err.message);
		postMessage({ id, type: WorkerMessageType.DB_INIT_RESPONSE, payload: { initialized: false, error: err.message } });
	}
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
	if (e.data.type == WorkerMessageType.DB_INIT) {
		initDb(e.data.id);
		return;
	}
	while (!dbStarted) {
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	const payload = e.data.payload;

	switch (e.data.type) {
		case WorkerMessageType.DB_INSERT:
			const { table, data } = payload;
			db.transaction(() => {
				const columns = Object.keys(data[0]).filter((col) => col != "updated");
				const stmt = db.prepare(
					`INSERT INTO ${table} (${columns.join(", ").replace("group", '"group"').replace("order", '"order"')}) VALUES (${columns.map(() => "?").join(", ")})`
				);
				for (const row of data) {
					stmt.bind(columns.map((col) => row[col]));
					stmt.step();
					stmt.reset();
				}
				stmt.finalize();
			});
			self.postMessage({ type: WorkerMessageType.DB_INSERT_RESPONSE, id: e.data.id });
			break;
		case WorkerMessageType.GET_UNIT:
			const unitData = db.exec(`SELECT * FROM Unit WHERE mulId = ${payload}`, { rowMode: "object", returnValue: "resultRows" })[0];
			const mulUnit = convertUnitDataToMulUnit(unitData);
			self.postMessage({ type: WorkerMessageType.GET_UNIT_RESPONSE, id: e.data.id, payload: mulUnit });
			break;
		case WorkerMessageType.IS_AVAILABLE:
			const { unitId, factions, eras } = payload;
			const sql = `SELECT * FROM Availability WHERE unitId = ${unitId} ${factions.length ? `AND faction IN (${factions.join(",")})` : ""} ${eras.length ? `AND era IN (${eras.join(",")})` : ""}`;
			const available = db.exec(sql, { rowMode: "object", returnValue: "resultRows" })[0] != undefined;
			self.postMessage({ type: WorkerMessageType.IS_AVAILABLE_RESPONSE, id: e.data.id, payload: available });
			break;
		case WorkerMessageType.GET_UNIT_AVAILABILITY:
			const unitAvailability = db
				.exec(
					`SELECT Availability.era, group_concat(Availability.faction) as "factions" FROM Availability INNER join Era on Availability.era = Era.id WHERE Availability.unitId = ${payload} group by Availability.era order by Era."order"`,
					{ rowMode: "object", returnValue: "resultRows" }
				)
				.map((row: { era: number; factions: string }) => ({ era: row.era, factions: row.factions.split(",").map((f) => Number(f)) }));
			self.postMessage({ type: WorkerMessageType.GET_UNIT_AVAILABILITY_RESPONSE, id: e.data.id, payload: unitAvailability });
			break;
		case WorkerMessageType.GET_RESULT_LIST:
			const resultQuery = buildResultListQuery(payload.factions, payload.eras, payload.eraSearchType, payload.factionSearchType);
			const result = db.exec(resultQuery, { rowMode: "object", returnValue: "resultRows" });
			self.postMessage({ type: WorkerMessageType.GET_RESULT_LIST_RESPONSE, id: e.data.id, payload: result });
			break;
		case WorkerMessageType.GET_UNIQUE_LIST:
			const unique = db.exec(`SELECT distinct unitId FROM Availability a WHERE ${payload.length ? `a.era IN (${payload.join(",")}) AND` : ""} a.faction = 4`, {
				rowMode: "object",
				returnValue: "resultRows"
			});
			self.postMessage({ type: WorkerMessageType.GET_UNIQUE_LIST_RESPONSE, id: e.data.id, payload: unique });
			break;
		case WorkerMessageType.GET_ERAS_AND_FACTIONS:
			const eraFactionList = db.exec(
				`SELECT a.eraId, a.factionId, e.name as eraName, e."order", f.name as factionName FROM FactionInEra a inner join era e on e.id = a.eraId inner join faction f on f.id = a.factionId order by e."order", f.name`,
				{ rowMode: "object", returnValue: "resultRows" }
			);
			const groupedResults = new Map<number, { name: string; order: number; factions: { id: number; name: string }[] }>();
			eraFactionList.forEach((r: { eraId: number; factionId: number; eraName: string; order: number; factionName: string }) => {
				if (groupedResults.has(r.eraId)) {
					groupedResults.get(r.eraId)!.factions.push({ id: r.factionId, name: r.factionName });
				} else {
					groupedResults.set(r.eraId, { name: r.eraName, order: r.order, factions: [{ id: r.factionId, name: r.factionName }] });
				}
			});
			self.postMessage({ type: WorkerMessageType.GET_ERAS_AND_FACTIONS_RESPONSE, id: e.data.id, payload: groupedResults });
			break;
		default:
			log(`Unknown message type: ${e.data.type}`);
	}
};

function buildResultListQuery(factions: number[], eras: number[], eraSearchType: "any" | "every", factionSearchType: "any" | "every") {
	let sql = `SELECT * FROM Unit u`;
	const clauses: string[] = [];

	if (factions.length == 0 && eras.length == 0) return sql;

	sql += ` WHERE `;

	if (eraSearchType == "any" && factionSearchType == "any") {
		clauses.push(
			`EXISTS (SELECT 1 FROM Availability a WHERE u.id = a.unitId ${eras.length ? `AND a.era IN (${eras.join(",")})` : ""} ${factions.length ? `AND a.faction IN (${factions.join(",")})` : ""})`
		);
	} else if (eraSearchType == "any" && factionSearchType == "every") {
		for (const faction of factions) {
			clauses.push(`EXISTS (SELECT 1 FROM Availability a WHERE u.id = a.unitId ${eras.length ? `AND a.era IN (${eras.join(",")})` : ""} AND a.faction = ${faction})`);
		}
	} else if (eraSearchType == "every" && factionSearchType == "any") {
		for (const era of eras) {
			clauses.push(`EXISTS (SELECT 1 FROM Availability a WHERE u.id = a.unitId AND a.era = ${era} ${factions.length ? `AND a.faction IN (${factions.join(",")})` : ""})`);
		}
	} else if (eraSearchType == "every" && factionSearchType == "every") {
		for (const era of eras) {
			for (const faction of factions) {
				clauses.push(`EXISTS (SELECT 1 FROM Availability a WHERE u.id = a.unitId AND a.era = ${era} AND a.faction = ${faction})`);
			}
		}
	}

	sql += clauses.join(" AND ");
	sql += " ORDER BY u.tonnage nulls last, u.name";
	return sql;
}
