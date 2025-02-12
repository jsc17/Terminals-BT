import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma.js";
import { drawListHorizontal, drawListVertical } from "./utilities/printSublists.js";
import { PDFDocument, PageSizes, PDFPage, StandardFonts } from "pdf-lib";
import { makePDF } from "./utilities/printList.js";
import { type ListCode } from "./types/listCode.js";

export const actions = {
	getListNames: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		const lists = await prisma.listV2.findMany({
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
	saveList: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		const body = (await request.formData()).get("body");
		if (!body) {
			return fail(400, { message: "failed to save list. Data not transmitted" });
		}

		const parsedBody: ListCode = JSON.parse(body.toString());

		const data = {
			userId: locals.user.id,
			id: parsedBody.id,
			name: parsedBody.name,
			era: Number(parsedBody.era),
			faction: Number(parsedBody.faction),
			units: JSON.stringify(parsedBody.units),
			formations: JSON.stringify(parsedBody.formations),
			sublists: JSON.stringify(parsedBody.sublists),
			rules: parsedBody.rules,
			lcVersion: 1
		};
		try {
			const existingList = await prisma.listV2.findFirst({
				where: {
					userId: locals.user.id,
					name: parsedBody.name
				}
			});
			if (!existingList) {
				await prisma.listV2.create({
					data
				});
				return { message: "List created successfully" };
			} else {
				await prisma.listV2.update({
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
		const lists = await prisma.listV2.findMany({
			where: {
				userId: locals.user.id
			}
		});

		if (!lists) {
			return fail(400, { message: "Failed to retrieve lists" });
		}

		return { lists: JSON.stringify(lists) };
	},
	deleteList: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		const { name } = (await request.json()) as Record<string, string>;

		try {
			await prisma.list.deleteMany({
				where: {
					userId: locals.user.id,
					name
				}
			});
			return { message: "List deleted successfully" };
		} catch (error) {
			console.error(error);
			return fail(400, { message: "Failed to delete list" });
		}
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
