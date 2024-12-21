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
import { makePDF } from "./utilities/printList.js";

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
		const list = JSON.parse(formData.get("body")!.toString());
		const printFormations = formData.get("drawFormations")?.toString() == "on"
		const blob = await makePDF(list, printFormations);
		const bytes = await blob.bytes();
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
		let slot = 0;
		let slotCount = layout == "vertical" ? 9 : 11;
		for (let index = 0; index < orderedSublists.length; index++) {
			let pageCount = Math.floor(slot / slotCount);
			if (pageCount >= pages.length) {
				pages.push(pdf.addPage(PageSizes.Letter));
			}
			if (layout == "vertical") {
				slot = drawListVertical(pdf, orderedSublists[index], pages, slot, helvetica, helveticaBold);
			} else {
				slot = drawListHorizontal(pdf, orderedSublists[index], pages, slot, helvetica, helveticaBold);
			}
			slot++;
		}

		const bytes = await pdf.save();
		return { pdf: JSON.stringify(bytes) };
	}
};
