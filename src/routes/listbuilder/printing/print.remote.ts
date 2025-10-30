import { query } from "$app/server";
import * as v from "valibot";
import { PrintListSchema, PrintOptionsSchema } from "./types";
import playwright from "playwright";
import { render } from "svelte/server";
import ListTemplate from "./templates/ListTemplate.svelte";
import { getAmmoByName } from "$lib/remote/ammo.remote";
import { getCustomUnitData, getMULDataFromId } from "$lib/remote/unit.remote";
import { getMulCard, getMulImage } from "./mulImages.remote";
import { PDFDocument } from "pdf-lib";

export const printList = query(
	v.object({
		listData: PrintListSchema,
		printOptions: PrintOptionsSchema
	}),
	async ({ listData, printOptions }) => {
		const mulUnitData = new Map(
			(await Promise.allSettled(listData.units.map(async (u) => (u.mulId >= 0 ? getMULDataFromId(u.mulId) : getCustomUnitData(u.mulId)))))
				.filter((u) => u.status == "fulfilled")
				.map((u) => [u.value!.mulId, u.value!])
		);

		const ammoReferenceList = (
			await Promise.allSettled(
				listData.units
					.flatMap((u) => u.customization?.ammo)
					.filter((v) => v != undefined)
					.map(async (v) => getAmmoByName(v))
			)
		)
			.filter((r) => r.status == "fulfilled")
			.map((r) => `${r.value!.name} (${r.value!.page})`);

		const unitImages = new Map(
			(
				await Promise.allSettled(
					mulUnitData
						.values()
						.filter((u) => u.mulId >= 0)
						//@ts-ignore ignores custom cards not having an imagelink
						.map(async (u) => getMulImage({ mulId: u.mulId, unitImageLink: u.imageLink ?? "" }))
				)
			)
				.filter((r) => r.status == "fulfilled")
				.map((r) => [r.value.mulId, r.value.image ?? ""])
		);

		const unitCardImages = new Map(
			(await Promise.allSettled(listData.units.map(async (u) => getMulCard({ mulId: u.mulId, skill: u.skill }))))
				.filter((r) => r.status == "fulfilled")
				.map((r) => [r.value.mulId, r.value.image ?? ""])
		);
		console.log(unitCardImages.size);
		const bsList = Map.groupBy(listData.bs ?? [], (v) => v);

		const browser = await playwright.chromium.launch({ headless: true });

		const page = await browser.newPage();
		const html = render(ListTemplate, { props: { listData, printOptions, mulUnitData, ammoReferenceList, unitImages, unitCardImages, bsList, scaList: listData.scas ?? [] } });
		await page.setContent(html.head + html.body);
		const pdf = await page.pdf({ format: "Letter", printBackground: true, margin: { top: "0.125in", bottom: "0.125in", left: "0.125in", right: "0.125in" } });
		const doc = await PDFDocument.load(new Uint8Array(pdf));
		doc.setCreator("Terminal");
		doc.setKeywords([printOptions.printStyle, "v2"]);
		return await doc.save();
	}
);
