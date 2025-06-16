import type { Browser, Page } from "playwright";
import fs from "fs/promises";
import { loadMULUnitServer } from "$lib/utilities/load";
import type { UnitV2 } from "$lib/types";
import { nanoid } from "nanoid";
import { render } from "svelte/server";
import Wrapper from "./Wrapper.svelte";
import { existsSync } from "fs";

//download images for mul cards

export async function loadUnitCardImage(mulId: number, skill?: number): Promise<string> {
	return new Promise(async (resolve) => {
		if (mulId < 0) {
			const localPath = `./files/cached-cards/customCardImages/${mulId}.png`;
			if (existsSync(localPath)) {
				const data = await fs.readFile(localPath, { encoding: "base64" });
				resolve("data:image/png;base64," + data);
			}
		} else {
			const localPath = `./files/cached-cards/${mulId}-${skill}.png`;
			if (existsSync(localPath)) {
				const data = await fs.readFile(localPath, { encoding: "base64" });
				resolve("data:image/png;base64," + data);
			} else {
				try {
					const url = `https://masterunitlist.azurewebsites.net/Unit/Card/${mulId}?skill=${skill}`;
					const response = await fetch(url);

					const buffer = new Uint8Array(await response.arrayBuffer());
					await fs.writeFile(localPath, buffer);
					resolve("data:image/png;base64," + Buffer.from(buffer).toString("base64"));
				} catch (error) {
					console.log(error);
				}
			}
		}
	});
}

//puppeteer for card generation
export async function renderHTMLfromUnit(unit: UnitV2) {
	let image = await loadImage(unit.baseUnit.mulId.toString(), unit.baseUnit.imageLink ?? "");
	const renderedComponent = render(Wrapper, {
		props: { unit, image }
	});

	return renderedComponent.head + renderedComponent.body;
}

export async function loadImage(mulId: string, unitImageLink: string) {
	const localPath = `./files/unit-images/${mulId}.png`;

	if (existsSync(localPath)) {
		const data = await fs.readFile(localPath, { encoding: "base64" });
		return "data:image/png;base64," + data;
	} else {
		try {
			console.log("Downloading new png from MUL");
			const response = await fetch(unitImageLink);
			const buffer = new Uint8Array(await response.arrayBuffer());
			await fs.writeFile(localPath, buffer);
			return "data:image/png;base64," + Buffer.from(buffer).toString("base64");
		} catch (error) {
			console.log(error);
			return "";
		}
	}
}

export async function generateUnitCard(unit: UnitV2, browser: Browser) {
	if (unit.baseUnit.mulId < 0) {
		return loadUnitCardImage(unit.baseUnit.mulId);
	}
	const page = await browser.newPage();
	const html = await renderHTMLfromUnit(unit);
	await page.setContent(html);

	const content = await page.$("body");
	const imageBuffer = await content!.screenshot({ omitBackground: true });
	return "data:image/png;base64," + Buffer.from(imageBuffer).toString("base64");
}
