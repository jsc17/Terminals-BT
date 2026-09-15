import type { RequestEvent } from "@sveltejs/kit";
import { chromium } from "playwright";
import { getMULDataFromId } from "$lib/remote/unit.remote";
import type { ListUnit } from "$lib/types/listTypes";
import { getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";
import { render } from "svelte/server";
import { getMulImage } from "$lib/remote/mulImages.remote";
import Template from "./Template.svelte";

export async function GET({ url }: RequestEvent) {
	const unitId = url.searchParams.get("id");
	const skill = url.searchParams.get("skill") ?? 4;

	if (!unitId) return new Response("Rendering error: Missing Unit Id", { status: 500 });
	if (isNaN(Number(unitId))) return new Response("Rendering error: Invalid Id", { status: 500 });
	const mulData = await getMULDataFromId(Number(unitId));
	if (!mulData) return new Response("Rendering error: Unit Data not found", { status: 500 });
	const image = await getMulImage(mulData.imageLink ?? "");
	const unit: ListUnit = {
		id: "0",
		baseUnit: mulData,
		skill: Number(skill),
		cost: getNewSkillCost(Number(skill), mulData.pv)
	};
	const html = render(Template, {
		props: { unit, image: image.image }
	});

	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage({ viewport: { width: 732, height: 256 } });
	await page.setContent(html.head + html.body);
	const buffer = await page.screenshot({ type: "png", fullPage: true });
	await browser.close();

	return new Response(buffer, {
		status: 200,
		headers: { "Content-Type": "image/png" }
	});
}

export const prerender = false;
