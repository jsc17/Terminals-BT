import fs from "fs/promises";
import {
	drawUnitCard,
	drawCondensedUnitCard,
	drawBasicHeader,
	drawBasicUnitLine,
	drawDetailedHeader,
	drawDetailedUnitLine,
	drawSummary,
	drawReferences
} from "$lib/utilities/printUnitLists.js";
import { PDFDocument, PageSizes, PDFPage, StandardFonts } from "pdf-lib";
import type { Unit } from "$lib/types/unit.js";
import references from "$lib/data/reference.json";
import { drawListHorizontal, drawListVertical } from "$lib/utilities/printSublists.js";
import { GITHUB_TOKEN } from "$env/static/private";
import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma.js";

export const actions = {
	createIssue: async ({ request }) => {
		const formData = await request.formData();
		let title = formData.get("issueTitle"),
			labels = formData.get("issueType"),
			details = formData.get("issueDetails");
		let body: string;
		if (labels == "bug") {
			let page = formData.get("issuePage");
			let era = formData.get("issueEra");
			let faction = formData.get("issueFaction");
			let device = formData.get("issueDevice");

			body = `Issue Page:\n${page}\n\nIssue Device:\n${device}\n\nIssue Details:\n${details}`;
			if (era) {
				body += `\n\nEra:\n${era}`;
			}
			if (faction) {
				body += `\n\nFaction:\n${faction}`;
			}
		} else {
			body = `Feature Details:\n${details}`;
		}
		let issue = { title: title, labels: [labels], assignees: ["jsc17"], body: body };
		const response = await fetch(`https://api.github.com/repos/jsc17/Terminals-BT/issues`, {
			method: "post",
			body: JSON.stringify(issue),
			headers: { accept: "application/vnd.github+json", Authorization: `Bearer ${GITHUB_TOKEN}` }
		});
		const json = await response.json();
		if (response.status == 201) {
			console.log(`Issue created successfully at ${json.url}`);
		} else {
			console.log(`Something went wrong: ${json}`);
		}
		return { status: response.status, url: json.html_url };
	},
	search: async ({ request }) => {
		let found = false,
			refresh = false,
			results = [];
		let { era, faction } = await request.json();
		let fileList = await fs.readdir("./files/cached");
		let date = new Date();
		let cachedIndex = fileList.findIndex((fileName) => {
			let parts = fileName.split("-");
			return parseInt(parts[0]) == era && parseInt(parts[1]) == faction;
		});
		fs.appendFile("./files/log.txt", `${date.getMonth() + 1}-${date.getDate()}: ${era}-${faction} \n`);
		if (cachedIndex != -1) {
			let filename = fileList[cachedIndex];

			let parts = filename.split("-");
			if (parseInt(parts[2]) != date.getMonth() + 1 || parseInt(parts[3]) != date.getDate()) {
				refresh = true;
			}
			let cachedFile = await fs.readFile(`./files/cached/${filename}`);

			found = true;
			results = JSON.parse(cachedFile.toString());
		}

		return { found, refresh, results };
	},
	cache: async ({ request }) => {
		let { era, faction, units } = await request.json();
		let filename = `${era}-${faction}-`;

		let date = new Date();
		let day = date.getDate();
		let month = date.getMonth() + 1;

		if (month < 10) {
			filename += `0${month}-`;
		} else {
			filename += `${month}-`;
		}
		if (day < 10) {
			filename += `0${day}-${date.getFullYear()}.json`;
		} else {
			filename += `${day}-${date.getFullYear()}.json`;
		}
		let fileList = await fs.readdir("./files/cached");
		let cachedIndex = fileList.findIndex((fileName) => {
			let parts = fileName.split("-");
			return parseInt(parts[0]) == era && parseInt(parts[1]) == faction;
		});
		if (cachedIndex != -1) {
			fs.unlink(`./files/cached/${fileList[cachedIndex]}`);
		}

		await fs.writeFile(`./files/cached/${filename}`, JSON.stringify(units));
	},
	print: async ({ request }) => {
		const formData = await request.formData();
		const { units, playername, listname, era, faction, general, style, condense } = JSON.parse(formData.get("body")!.toString());

		const pdf = await PDFDocument.create();
		const [helvetica, helveticaBold] = await Promise.all([pdf.embedFont(StandardFonts.Helvetica), pdf.embedFont(StandardFonts.HelveticaBold)]);
		const listSummary = pdf.addPage(PageSizes.Letter);
		listSummary.setFont(helvetica);
		const { width, height } = listSummary.getSize();
		let listPv = 0;
		listSummary.drawText(listname, { x: 90, y: height - 54, size: 16 });
		listSummary.drawText(playername, { x: width - 180, y: height - 54, size: 12 });
		let description = era + " Era - " + faction + " with " + general + " general list";
		listSummary.drawText(description, { x: 95, y: height - 72, size: 8 });

		if (style == "mul") {
			drawBasicHeader(listSummary);
			units.forEach((unit: Unit, index: number) => {
				drawBasicUnitLine(listSummary, index, unit);
				listPv += unit.cost;
			});
		} else {
			drawDetailedHeader(listSummary);
			units.forEach((unit: Unit, index: number) => {
				drawDetailedUnitLine(listSummary, index, unit);
				listPv += unit.cost;
			});
		}
		drawSummary(listSummary, units.length, listPv);
		let abilityReferences: any[] = [];
		units.forEach((unit: Unit) => {
			references.forEach((reference) => {
				if (unit.abilities.includes(reference.ability)) {
					if (abilityReferences.find((ability) => ability.name == reference.name) == undefined) {
						abilityReferences.push(reference);
					}
				}
			});
		});
		drawReferences(listSummary, abilityReferences);
		let pages: PDFPage[] = [];
		let pageSlots = condense ? 10 : 8;
		for (let p = 0; p < Math.ceil(units.length / pageSlots); p++) {
			pages.push(pdf.addPage(PageSizes.Letter));
		}

		let promises = [];
		for (let index = 0; index < units.length; index++) {
			if (condense) {
				let page = pages[Math.floor(index / 10)];
				promises.push(drawCondensedUnitCard(pdf, page, units[index], index));
			} else {
				let page = pages[Math.floor(index / 8)];
				promises.push(drawUnitCard(pdf, page, units[index], index));
			}
		}
		await Promise.all(promises);

		const bytes = await pdf.save();
		return { pdf: JSON.stringify(bytes) };
	},
	printSublists: async ({ request }) => {
		const formData = await request.formData();
		const sublists = JSON.parse(formData.get("sublists")!.toString());
		const layout = formData.get("sublistPrintLayout");
		const grouped = formData.get("sublistPrintGrouping");
		let orderedSublists = [];

		if (grouped == "on") {
			for (const scenario of ["Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight", "-"]) {
				for (const list of sublists) {
					if (list.scenario == scenario) {
						orderedSublists.push(list);
					}
				}
			}
		} else {
			orderedSublists = sublists;
		}

		const pdf = await PDFDocument.create();
		const [helvetica, helveticaBold] = await Promise.all([pdf.embedFont(StandardFonts.Helvetica), pdf.embedFont(StandardFonts.HelveticaBold)]);

		const pages: PDFPage[] = [];
		for (let p = 0; p < Math.ceil(orderedSublists.length / 12); p++) {
			pages.push(pdf.addPage(PageSizes.Letter));
		}
		for (let index = 0; index < orderedSublists.length; index++) {
			let page = pages[Math.floor(index / 12)];
			let slot = index % 12;
			if (layout == "vertical") {
				drawListVertical(orderedSublists[index], page, slot, helvetica, helveticaBold);
			} else {
				drawListHorizontal(orderedSublists[index], page, slot, helvetica, helveticaBold);
			}
		}

		const bytes = await pdf.save();
		return { pdf: JSON.stringify(bytes) };
	},
	saveList: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		const { name, era, faction, units, sublists } = Object.fromEntries(await request.formData()) as Record<string, string>;
		const data = { userId: locals.user.id, name, era: Number(era), faction: Number(faction), units, sublists };
		try {
			const existingList = await prisma.list.findFirst({
				where: {
					userId: locals.user.id,
					name
				}
			});
			if (!existingList) {
				await prisma.list.create({
					data
				});
				return { message: "List created successfully" };
			} else {
				await prisma.list.update({
					where: {
						id: existingList.id
					},
					data
				});
				return { message: "List updated successfully" };
			}
		} catch (err) {
			console.error(err);
			return fail(400, { message: "Failed to create list in database" });
		}
	},
	loadList: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		const lists = await prisma.list.findMany({
			where: {
				userId: locals.user.id
			}
		});

		if (!lists) {
			return fail(400, { message: "Failed to retrieve lists" });
		}

		return { lists: JSON.stringify(lists) };
	}
};
