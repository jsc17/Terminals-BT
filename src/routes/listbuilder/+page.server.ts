import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma.js";
import { drawListHorizontal, drawListVertical } from "./utilities/printSublists.js";
import { PDFDocument, PageSizes, PDFPage, StandardFonts } from "pdf-lib";

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
