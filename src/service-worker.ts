/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from "$service-worker";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

let db: any;

async function initDb() {
	console.log("initDb");
	if (db) return db;

	const sqlite3 = await sqlite3InitModule();
	console.log("version: " + sqlite3.version.libVersion);
	if (`opfs` in sqlite3.oo1) {
		db = new sqlite3.oo1.OpfsDb("test.db");
		console.log("OPFS DB Created");
	} else {
		db = new sqlite3.oo1.DB();
		console.log("In-Memory DB Created");
	}

	return db;
}

//install service worker
self.addEventListener("install", (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}
	event.waitUntil(addFilesToCache());
});

// activate service worker
self.addEventListener("activate", (event) => {
	initDb();
	console.log("Service worker activated");
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

//listen to fetch events
self.addEventListener("fetch", (event) => {});
