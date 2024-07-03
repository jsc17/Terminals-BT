import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma.js";
import { drawListHorizontal, drawListVertical } from "./utilities/printSublists.js";
import {
	drawUnitCard,
	drawCondensedUnitCard,
	drawBasicHeader,
	drawBasicUnitLine,
	drawDetailedHeader,
	drawDetailedUnitLine,
	drawFormationLine,
	drawSummary,
	drawReferences
} from "./utilities/printUnitLists.js";
import { PDFDocument, PageSizes, PDFPage, StandardFonts } from "pdf-lib";
import references from "$lib/data/reference.json";
import { eras, factions } from "$lib/data/erasFactionLookup.js";
import { isUnit } from "$lib/types/unit.js";
import type { Formation } from "$lib/types/formation.svelte.js";

export const actions = {
	getListNames: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		const lists = await prisma.list.findMany({
			where: {
				userId: locals.user.id
			},
			select: {
				name: true,
				era: true,
				faction: true,
				rules: true
			}
		});

		return { listNames: JSON.stringify(lists) };
	},
	printList: async ({ request }) => {
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
		let description = eras.get(era) + " Era - " + factions.get(faction) + " with " + factions.get(general) + " general list";
		listSummary.drawText(description, { x: 95, y: height - 72, size: 8 });

		let abilityReferences: any[] = [];

		if (style == "mul") {
			drawBasicHeader(listSummary);
		} else {
			drawDetailedHeader(listSummary);
		}
		let line = 0;
		let unitCount = 0;
		const formationList: Formation[] = [];
		for (const item of units) {
			if (isUnit(item)) {
				if (style == "mul") {
					drawBasicUnitLine(listSummary, line, item);
				} else {
					drawDetailedUnitLine(listSummary, line, item);
				}
				listPv += item.cost;
				references.forEach((reference) => {
					if (item.abilities.includes(reference.ability)) {
						if (abilityReferences.find((ability) => ability.name == reference.name) == undefined) {
							abilityReferences.push(reference);
						}
					}
				});
				line++;
				unitCount++;
			} else {
				if (formData.get("drawFormations") == "on") {
					formationList.push(item);
				} else {
					for (const unit of item.units) {
						if (style == "mul") {
							drawBasicUnitLine(listSummary, line, unit);
						} else {
							drawDetailedUnitLine(listSummary, line, unit);
						}
						listPv += unit.cost;
						references.forEach((reference) => {
							if (unit.abilities.includes(reference.ability)) {
								if (abilityReferences.find((ability) => ability.name == reference.name) == undefined) {
									abilityReferences.push(reference);
								}
							}
						});
						line++;
						unitCount++;
					}
				}
			}
		}

		for (const formation of formationList) {
			drawFormationLine(listSummary, line, formation);
			line++;
			for (const unit of formation.units) {
				if (style == "mul") {
					drawBasicUnitLine(listSummary, line, unit);
				} else {
					drawDetailedUnitLine(listSummary, line, unit);
				}
				listPv += unit.cost;
				references.forEach((reference) => {
					if (unit.abilities.includes(reference.ability)) {
						if (abilityReferences.find((ability) => ability.name == reference.name) == undefined) {
							abilityReferences.push(reference);
						}
					}
				});
				line++;
				unitCount++;
			}
		}

		drawSummary(listSummary, line, unitCount, listPv);
		drawReferences(listSummary, abilityReferences);
		listSummary.drawText("https://terminal.tools/listbuilder", { x: 25, y: 25, size: 6 });
		let pages: PDFPage[] = [];
		let pageSlots = condense ? 10 : 8;
		for (let p = 0; p < Math.ceil(unitCount / pageSlots); p++) {
			pages.push(pdf.addPage(PageSizes.Letter));
		}

		let promises = [];
		let index = 0;
		for (const item of units) {
			if (isUnit(item)) {
				if (condense) {
					let page = pages[Math.floor(index / 10)];
					promises.push(drawCondensedUnitCard(pdf, page, item, index));
				} else {
					let page = pages[Math.floor(index / 8)];
					promises.push(drawUnitCard(pdf, page, item, index));
				}
				index++;
			} else {
				for (const unit of item.units) {
					if (condense) {
						let page = pages[Math.floor(index / 10)];
						promises.push(drawCondensedUnitCard(pdf, page, unit, index));
					} else {
						let page = pages[Math.floor(index / 8)];
						promises.push(drawUnitCard(pdf, page, unit, index));
					}
					index++;
				}
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
	}
};
