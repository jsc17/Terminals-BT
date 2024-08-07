import fs from "fs/promises";
import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma.js";

export const actions = {
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
	saveList: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: "User not logged in" });
		}
		const body = (await request.formData()).get("body");
		if (!body) {
			return fail(400, { message: "failed to save list. Data not transmitted" });
		}

		const parsedBody = JSON.parse(body.toString());

		const data = {
			userId: locals.user.id,
			name: parsedBody.name,
			era: Number(parsedBody.era),
			faction: Number(parsedBody.faction),
			units: JSON.stringify(parsedBody.units),
			sublists: JSON.stringify(parsedBody.sublists),
			rules: parsedBody.rules
		};

		try {
			const existingList = await prisma.list.findFirst({
				where: {
					userId: locals.user.id,
					name: parsedBody.name
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
	getAllUnits: async () => {
		const unitList = await prisma.unit.findMany();
		return { unitList };
	},
	getUnits: async ({ request }) => {
		let { era, faction, general } = await request.json();
		let unitList;
		let uniqueList;
		if (era == 0 && faction == 0) {
			unitList = await prisma.unit.findMany({});
			uniqueList = await prisma.unit.findMany({
				where: {
					factions: {
						some: {
							faction: 4
						}
					}
				}
			});
		} else {
			const conditions: { [k: string]: any } = {};
			const uniqueConditions: { [k: string]: any } = { faction: 4 };
			if (era != 0) {
				conditions.era = era;
				uniqueConditions.era = era;
			}
			if (faction != 0) {
				conditions.OR = [{ faction }, { faction: general }];
			}
			unitList = await prisma.unit.findMany({
				where: {
					factions: {
						some: conditions
					}
				},
				orderBy: {
					tonnage: "asc"
				}
			});
			uniqueList = await prisma.unit.findMany({
				where: {
					factions: {
						some: uniqueConditions
					}
				},
				select: {
					mulId: true
				}
			});
		}
		if (unitList) {
			return { unitList, uniqueList };
		} else {
			return fail(400, { message: "Unit request failed" });
		}
	},
	getUnitAvailability: async ({ request }) => {
		let mulId = Number((await request.formData()).get("mulId"));

		const availabilityResults = await prisma.unit.findUnique({
			where: {
				mulId
			},
			select: {
				factions: {
					select: {
						era: true,
						faction: true
					}
				}
			}
		});

		const formattedAvailability = new Map<number, number[]>();
		if (availabilityResults) {
			for (const result of availabilityResults.factions) {
				const factionList = formattedAvailability.get(result.era);
				if (factionList) {
					factionList.push(result.faction);
				} else {
					formattedAvailability.set(result.era, [result.faction]);
				}
			}
		}
		const unitAvailability = [...formattedAvailability].map((entry) => {
			return { era: entry[0], factionList: entry[1] };
		});
		return { unitAvailability };
	},
	getUnit: async ({ request }) => {
		let { mulId } = await request.json();
		const unit = await prisma.unit.findUnique({
			where: {
				mulId: Number(mulId)
			}
		});
		return { unit };
	}
};
