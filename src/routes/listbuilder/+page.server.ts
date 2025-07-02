import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma.js";
import { printList } from "./printing/printList.js";
import { type ListCode } from "$lib/types/listTypes";
import { createSublistsPdf } from "./printing/printSublists.js";

export const load = async ({ url }) => {
	let sharedList;
	if (url.searchParams.get("share")) {
		sharedList = await prisma.sharedList.findUnique({ where: { id: url.searchParams.get("share")! } });
	}
	return {
		rules: url.searchParams.get("rules"),
		sharedList
	};
};

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
			lcVersion: parsedBody.lcVersion,
			scas: parsedBody.scas && parsedBody.scas.length ? JSON.stringify(parsedBody.scas) : null,
			bs: parsedBody.bs && parsedBody.bs.length ? JSON.stringify(parsedBody.bs) : null
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
				data.id = existingList.id;
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
		list.style = formData.get("printStyle")?.toString() ?? "detailed";
		list.cardStyle = formData.get("cardStyle")?.toString() ?? "mul";
		const printFormations = formData.get("drawFormations")?.toString() == "on";
		const printUnitsByFormation = formData.get("printUnitsByFormation")?.toString() == "on";
		const blob = await printList(list, printFormations, printUnitsByFormation);
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
	},
	shareList: async ({ request }) => {
		const formData = await request.formData();
		const list = formData.get("list");
		const id = formData.get("id")?.toString() ?? "";

		if (!list) {
			return fail(400, { message: "failed to save list. Data not transmitted" });
		}
		const parsedBody: ListCode = JSON.parse(list.toString());

		const data = {
			id,
			name: parsedBody.name,
			eras: JSON.stringify(parsedBody.eras),
			factions: JSON.stringify(parsedBody.factions),
			units: JSON.stringify(parsedBody.units),
			formations: JSON.stringify(parsedBody.formations),
			sublists: JSON.stringify(parsedBody.sublists),
			rules: parsedBody.rules,
			lcVersion: parsedBody.lcVersion,
			scas: parsedBody.scas && parsedBody.scas.length ? JSON.stringify(parsedBody.scas) : null
		};

		try {
			const newSharedList = await prisma.sharedList.create({ data });
			return { message: "list saved successfully", id: newSharedList.id };
		} catch (error) {
			console.error(error);
			return fail(400, { message: "Failed to create shareable list" });
		}
	},
	getFormationAvailability: async (event) => {
		const requestedIds: number[] = await event.request.json();
		const results = await prisma.factionInEra.findMany({ where: { units: { some: { unitId: { in: requestedIds } } } }, include: { units: true } });
		let filteredResults = [];

		for (const result of results) {
			let generalList = await prisma.factionInEra.findUnique({ where: { eraId_factionId: { eraId: result.eraId, factionId: result.general } }, include: { units: true } });
			let allFound = true;
			for (const requestedId of requestedIds) {
				const unitInFaction = result.units.find((unit) => {
					return unit.unitId == requestedId;
				});
				const unitInGeneral = generalList?.units.find((unit) => {
					return unit.unitId == requestedId;
				});
				if (unitInFaction === undefined && unitInGeneral === undefined) {
					allFound = false;
				}
			}
			if (allFound) {
				filteredResults.push(result);
			}
		}
		return {
			results: filteredResults.map((result) => {
				return { faction: result.factionId, era: result.eraId };
			})
		};
	}
};
