import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma.js";
import { printList } from "./utilities/printList.js";
import { type ListCode } from "./types/listCode.js";
import { createSublistsPdf } from "./utilities/printSublists.js";
import type { eras } from "$lib/data/erasFactionLookup.js";

export const actions = {
	getListNames: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		const lists = await prisma.listV3.findMany({
			where: {
				userId: locals.user.id
			},
			select: {
				id: true,
				name: true
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
			eras: JSON.stringify(parsedBody.eras),
			factions: JSON.stringify(parsedBody.factions),
			units: JSON.stringify(parsedBody.units),
			formations: JSON.stringify(parsedBody.formations),
			sublists: JSON.stringify(parsedBody.sublists),
			rules: parsedBody.rules,
			lcVersion: parsedBody.lcVersion
		};
		try {
			const existingList = await prisma.listV3.findFirst({
				where: {
					userId: locals.user.id,
					name: data.name
				}
			});
			if (!existingList) {
				await prisma.listV3.create({ data });
				return { message: "List created successfully" };
			} else {
				await prisma.listV3.update({
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
		const lists = await prisma.listV3.findMany({
			where: {
				userId: locals.user.id
			},
			orderBy: {
				name: "asc"
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
		const { id } = (await request.json()) as Record<string, string>;

		try {
			await prisma.listV3.deleteMany({
				where: {
					userId: locals.user.id,
					id
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
		const printFormations = formData.get("drawFormations")?.toString() == "on";
		const blob = await printList(list, printFormations);
		const bytes = await blob.bytes();
		return { pdf: JSON.stringify(bytes) };
	},
	printSublists: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get("name")?.toString() ?? "Sublist";
		const sublists = JSON.parse(formData.get("sublists")!.toString());
		const layout = formData.get("sublistPrintLayout")?.toString() ?? "vertical";
		const grouped = formData.get("sublistPrintGrouping") != undefined;
		const blob = await createSublistsPdf(sublists, layout, grouped, name);
		const bytes = await blob.bytes();
		return { pdf: JSON.stringify(bytes) };
	}
};
