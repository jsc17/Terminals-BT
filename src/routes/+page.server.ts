import fs from "fs/promises";
import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma.js";
import { eraLookup, factionLookup } from "$lib/data/erasFactionLookup.js";
import { handleParse } from "$lib/utilities/abilityUtilities.js";

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
	getCustomUnits: async (event) => {
		let { unitPacks } = await event.request.json();

		const customUnits = await prisma.customCard.findMany({
			where: {
				pack: { in: unitPacks }
			}
		});
		customUnits.forEach((unit) => {
			unit.abilities = unit.abilities ? JSON.stringify(handleParse(unit.abilities)) : "-";
		});
		return { customUnits };
	},
	getUnits: async ({ request }) => {
		let { eras, factions, eraSearchType, factionSearchType } = await request.json();

		let unitList: any[] = [];
		let uniqueList: any[] = [];

		let searchConditions: any;
		let uniqueConditions: any;

		if (!eras.length) {
			eraSearchType = "any";
		}
		if (!factions.length) {
			factionSearchType = "any";
		}

		if (eraSearchType == "any" && factionSearchType == "any") {
			searchConditions = {
				availability: {
					some: {
						era: eras.length == 0 ? undefined : { in: eras },
						faction: factions.length == 0 ? undefined : { in: factions }
					}
				}
			};
			uniqueConditions = {
				availability: {
					some: {
						era: eras.length == 0 ? undefined : { in: eras },
						faction: 4
					}
				}
			};
		} else if (eraSearchType == "every" && factionSearchType == "any") {
			searchConditions = {
				AND: eras.map((era: number) => {
					return {
						availability: {
							some: {
								era,
								faction: factions.length == 0 ? undefined : { in: factions }
							}
						}
					};
				})
			};
			uniqueConditions = {
				availability: {
					some: {
						era: eras.length == 0 ? undefined : { in: eras },
						faction: 4
					}
				}
			};
		} else if (eraSearchType == "every" && factionSearchType == "every") {
			searchConditions = {
				AND: eras.flatMap((era: number) => {
					return factions.map((faction: number) => {
						return {
							availability: {
								some: {
									era,
									faction
								}
							}
						};
					});
				})
			};

			uniqueConditions = {
				availability: {
					some: {
						era: eras.length == 0 ? undefined : { in: eras },
						faction: 4
					}
				}
			};
		} else if (eraSearchType == "any" && factionSearchType == "every") {
			searchConditions = {
				AND: factions.map((faction: number) => {
					return {
						availability: {
							some: {
								era: eras.length == 0 ? undefined : { in: eras },
								faction
							}
						}
					};
				})
			};
			uniqueConditions = {
				availability: {
					some: {
						era: eras.length == 0 ? undefined : { in: eras },
						faction: 4
					}
				}
			};
		}

		try {
			if (eras.length == 0 && factions.length == 0) {
				unitList = await prisma.unit.findMany({});
				uniqueList = await prisma.unit.findMany({
					where: {
						availability: {
							some: { faction: 4 }
						}
					}
				});
			} else {
				unitList = await prisma.unit.findMany({
					where: searchConditions,
					orderBy: { tonnage: "asc" }
				});
				uniqueList = await prisma.unit.findMany({
					where: uniqueConditions,
					select: { mulId: true }
				});
			}
		} catch (error) {
			return fail(400, { message: "Failed to load units" });
		}
		if (unitList.length) {
			unitList.forEach((unit) => {
				unit.abilities = unit.abilities ? JSON.stringify(handleParse(unit.abilities)) : "-";
			});

			return { message: "Units Loaded", unitList, uniqueList };
		} else {
			return { message: "No Units Found" };
		}
	},
	getUnitAvailability: async ({ request }) => {
		let mulId = Number((await request.formData()).get("mulId"));

		const availabilityResults = await prisma.unit.findUnique({
			where: {
				mulId
			},
			select: {
				availability: {
					select: {
						faction: true,
						era: true
					}
				}
			}
		});

		const formattedAvailability = new Map<string, string[]>();
		if (availabilityResults) {
			for (const result of availabilityResults.availability) {
				const eraName = eraLookup.get(result.era) ?? "Unknown";
				const factionName = factionLookup.get(result.faction) ?? "Unknown";
				const factionList = formattedAvailability.get(eraName);
				if (factionList) {
					factionList.push(factionName);
				} else {
					formattedAvailability.set(eraName, [factionName]);
				}
			}
		}
		const unitAvailability = [...formattedAvailability].map((entry) => {
			return { era: entry[0], factionList: entry[1] };
		});
		return { unitAvailability };
	},
	getUnit: async ({ request }) => {
		let { mulId }: { mulId: number } = await request.json();

		let unit;

		if (mulId >= 0) {
			unit = await prisma.unit.findUnique({
				where: {
					mulId: Number(mulId)
				}
			});
		} else {
			unit = await prisma.customCard.findUnique({
				where: {
					mulId: Number(mulId)
				}
			});
		}
		if (unit) {
			unit.abilities = JSON.stringify(unit.abilities ? handleParse(unit.abilities) : []);
		}
		return { unit };
	},
	getNotifications: async (event) => {
		let userId = event.locals.user?.id;

		let notifications;
		if (userId) {
			notifications = await prisma.notification.findMany({
				where: { userId },
				orderBy: { date: "desc" }
			});
		}

		return { notifications };
	},
	markNotificationsRead: async (event) => {
		let userId = event.locals.user?.id;

		if (userId) {
			await prisma.notification.updateMany({
				where: { userId },
				data: {
					read: true
				}
			});
		}
		return {};
	}
};
