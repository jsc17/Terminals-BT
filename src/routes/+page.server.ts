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
	getAllUnits: async () => {
		const unitList = await prisma.unit.findMany();
		return { unitList };
	},
	getUnits: async ({ request }) => {
		let { eras, factions, general, eraSearchType, factionSearchType } = await request.json();

		let unitList: any[] = [];
		let uniqueList: any[] = [];
		let generalList: any[] = [];
		let eraCondition: { AND?: any[], OR?: any[]} = {};
		if(eraSearchType == "any"){
			eraCondition.OR = eras.map((era: number) => {return { era }})
		} else {
			eraCondition.AND = eras.map((era: number) => {return { era }})
		}
		let factionCondition: { AND?: any[], OR?: any[]} = {};
		if(factionSearchType == "any"){
			factionCondition.OR = factions.map((era: number) => {return { era }})
		} else {
			factionCondition.AND = factions.map((era: number) => {return { era }})
		}
		console.log(eraCondition);
		console.log(factionCondition);

		if (eras.length == 0 && factions.length == 0) {
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
			unitList = await prisma.unit.findMany({
				where: {
					factions: {
						some: {
							AND: [
								{
									OR: eras.map((era: number) => {
										return { era };
									})
								},
								{
									OR: factions.map((faction: number) => {
										return { faction };
									})
								}
							]
						}
					}
				},
				orderBy: {
					tonnage: "asc"
				}
			});
			uniqueList = await prisma.unit.findMany({
				where: {
					factions: {
						some: {
							AND: [
								{
									OR: eras.map((era: number) => {
										return { era };
									})
								},
								{
									faction: 4
								}
							]
						}
					}
				},
				select: {
					mulId: true
				}
			});
			if (general != -1) {
				generalList = await prisma.unit.findMany({
					where: {
						factions: {
							some: { faction: general, era: eras[0] }
						}
					},
					orderBy: {
						tonnage: "asc"
					}
				});
			}
		}
		if (unitList) {
			return { unitList, uniqueList, generalList };
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
