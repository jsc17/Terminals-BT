import { query } from "$app/server";
import { existsSync } from "fs";
import * as v from "valibot";
import fs from "fs/promises";
import { prisma } from "$lib/server/prisma";

//gets entire unit card from the mul when provided with an id and a skill level. Attempts to access cached card first.
export const getMulCard = query.batch(v.object({ mulId: v.number(), skill: v.number() }), async (data) => {
	const lookup = new Map<string, string>();
	await Promise.allSettled(
		data.map(async ({ mulId, skill }) => {
			if (mulId < 0) {
				const localPath = `./files/cached-cards/customCardImages/${mulId}.png`;
				if (existsSync(localPath)) {
					const data = await fs.readFile(localPath, { encoding: "base64" });
					lookup.set(`${mulId}-${skill}`, "data:image/png;base64," + data);
				}
			} else {
				const localPath = `./files/cached-cards/${mulId}-${skill}.png`;
				if (existsSync(localPath)) {
					const data = await fs.readFile(localPath, { encoding: "base64" });
					lookup.set(`${mulId}-${skill}`, "data:image/png;base64," + data);
				} else {
					try {
						const url = `https://masterunitlist.azurewebsites.net/Unit/Card/${mulId}?skill=${skill}`;
						const response = await fetch(url);

						const buffer = new Uint8Array(await response.arrayBuffer());
						await fs.writeFile(localPath, buffer);
						lookup.set(`${mulId}-${skill}`, "data:image/png;base64," + Buffer.from(buffer).toString("base64"));
					} catch (error) {
						console.log(error);
					}
				}
			}
		})
	);
	return ({ mulId, skill }) => ({ mulId, image: lookup.get(`${mulId}-${skill}`) });
});

//gets the unit image when provided with an mulId and a unit image link. Attempts to access cached image first, before downloading it from the mul and caching it for future use.
export const getMulImage = query.batch(v.string(), async (data) => {
	const lookup = new Map<string, string>();

	await Promise.allSettled(
		data.map(async (link) => {
			const imageId = await prisma.unitImage.findFirst({ where: { link } });
			if (imageId != null && existsSync(`./files/unit-images/${imageId.id}.png`)) {
				const localPath = `./files/unit-images/${imageId.id}.png`;
				const data = await fs.readFile(localPath, { encoding: "base64" });
				lookup.set(link, "data:image/png;base64," + data);
			} else {
				try {
					console.log("Downloading new png from MUL");
					const response = await fetch(link);
					const buffer = new Uint8Array(await response.arrayBuffer());
					const newImage = await prisma.unitImage.create({
						data: {
							link
						}
					});
					const localPath = `./files/unit-images/${newImage.id}.png`;
					await fs.writeFile(localPath, buffer);
					lookup.set(link, "data:image/png;base64," + Buffer.from(buffer).toString("base64"));
				} catch (error) {
					console.log(error);
					lookup.set(link, "");
				}
			}
		})
	);

	return (link) => ({ link, image: lookup.get(link) });
});
