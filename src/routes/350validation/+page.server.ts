//@ts-nocheck
import { getDocument } from "pdfjs-dist";
import { prisma } from "$lib/server/prisma.js";
import { fail } from "@sveltejs/kit";
import { parsePDF, parseTerminal } from "./parse.js";
import fs from "fs/promises";

export const load = async () => {
	let allTournaments = await prisma.tournament.findMany({
		where: {
			passed: false
		}
	});

	return { tournamentList: JSON.stringify(allTournaments) };
};

export const actions = {
	getTournaments: async () => {
		try {
			let allTournaments = await prisma.tournament.findMany({
				where: {
					passed: false
				}
			});

			return { tournamentList: JSON.stringify(allTournaments) };
		} catch (error) {
			console.log(error);
			return fail(400, { message: "Failed to get tournament list" });
		}
	},
	parseUnits: async ({ request }) => {
		const { uploadType, uploadData, era, faction } = Object.fromEntries(await request.formData());
		let unitList;
		if (uploadType == "mul") {
			const buffer = await uploadData.arrayBuffer();
			try {
				const pdf = await getDocument(buffer).promise;
				unitList = await parsePDF(pdf, era, faction);
			} catch (error) {
				console.log(error);
				return fail(400, { message: "Failed to create pdf object" });
			}
		} else if (uploadType == "terminal") {
			unitList = await parseTerminal(uploadData.toString().split("-")[0].split(":").slice(2).join(":"));
		} else if (uploadType == "terminalSaved") {
			unitList = await parseTerminal(uploadData.toString());
		} else if (uploadType == "jeff") {
		} else {
			return fail(400, { message: "Invalid format type" });
		}
		return { unitList: JSON.stringify(unitList) };
	},
	getUserLists: async ({ locals }) => {
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
				units: true,
				sublists: true
			}
		});
		return { lists };
	},
	getUnits: async () => {
		let unitList = await prisma.unit.findMany({
			select: {
				name: true,
				mulId: true
			}
		});
		return { unitList: JSON.stringify(unitList) };
	},
	validate: async ({ request }) => {
		let { unitList, era, faction } = Object.fromEntries(await request.formData());

		unitList = JSON.parse(unitList);

		const fileList = await fs.readdir(`./files/cached`);
		const factionIndex = fileList.findIndex((fileName) => {
			let parts = fileName.split("-");
			return parseInt(parts[0]) == era && parseInt(parts[1]) == faction;
		});
		const uniqueIndex = fileList.findIndex((fileName) => {
			let parts = fileName.split("-");
			return parseInt(parts[0]) == era && parseInt(parts[1]) == 4;
		});
		const cachedFile = JSON.parse((await fs.readFile(`./files/cached/${fileList[factionIndex]}`)).toString());
		const uniqueFile = JSON.parse((await fs.readFile(`./files/cached/${fileList[uniqueIndex]}`)).toString());

		let counts = {
			unavailableUnits: [],
			totalPV: 0,
			totalUnits: 0,
			totalMechs: 0,
			totalCV: 0,
			totalInf: 0,
			totalProto: 0,
			unallowedTypes: [],
			rulesLevel: [],
			unique: [],
			dro: [],
			jmpsTotal: 0,
			jmps: [],
			trailer: [],
			htc: [],
			skillThreshold: [],
			skillCombination: [],
			chassisList: [],
			chassis: [],
			variantList: [],
			variant: []
		};

		for (const unit of unitList) {
			if (unit.mulId == 0) {
				counts.unavailableUnits.push(unit.name);
			} else {
				let unitIndex = cachedFile.Units.findIndex((tempUnit) => {
					return tempUnit.Id == unit.mulId;
				});
				let uniqueIndex = uniqueFile.Units.findIndex((tempUnit) => {
					return tempUnit.Id == unit.mulId;
				});
				if (unitIndex == -1) {
					counts.unavailableUnits.push(unit.name);
				}
				if (uniqueIndex != -1) {
					counts.unique.push(unit.name);
				}
				await validateUnit(unit, counts);
			}
			counts.totalPV += unit.pv;
			counts.totalUnits += 1;
		}
		const issueList = validateList(counts);
		return { issueList: JSON.stringify(issueList) };
	},
	submit: async ({ request, locals }) => {
		const { id, unitList, issueList, name, email, message, era, faction } = Object.fromEntries(await request.formData());

		const unitCodes = JSON.parse(unitList).map((unit) => `${unit.mulId},${unit.skill}`);
		const unitString = unitCodes.join(":");

		const issues = JSON.parse(issueList).map((issue) => `${issue.title}: (${issue.violatingUnits})`);
		const issueString = issues.join(", ");

		let userId = locals.user?.id;

		let existingUser;
		if (userId) {
			existingUser = await prisma.tournamentParticipant.findFirst({
				where: {
					tournamentId: Number(id),
					userId
				}
			});
		}

		if (existingUser) {
			await prisma.listCode.create({
				data: {
					participantId: existingUser.id,
					valid: issueString.length == 0,
					issues: issueString,
					units: unitString,
					message,
					era: Number(era),
					faction: Number(faction)
				}
			});
		} else {
			await prisma.tournamentParticipant.create({
				data: {
					tournamentId: Number(id),
					name,
					userId,
					email,
					listCodes: {
						create: {
							valid: issueString.length == 0,
							issues: issueString,
							units: unitString,
							message,
							era: Number(era),
							faction: Number(faction)
						}
					}
				}
			});
		}
	}
};

async function validateUnit(unit: any, counts: any) {
	const unitData = await prisma.unit.findFirst({
		where: {
			mulId: unit.mulId
		}
	});
	switch (unitData?.type.toUpperCase()) {
		case "BM":
		case "IM":
			counts.totalMechs++;
			counts.variantList.push(unitData.name);
			if (
				counts.variantList.filter((variant) => {
					return variant == unitData.name;
				}).length >= 2
			) {
				counts.variant.push(unitData.name);
			}
			break;
		case "PM":
			counts.totalProto++;
			break;
		case "CV":
			counts.totalCV++;
			break;
		case "CI":
		case "BA":
			counts.totalInf++;
			break;
		case "BS":
			break;
		default:
			counts.unallowedTypes.push(unitData.name);
	}
	counts.chassisList.push(unitData.name);
	if (
		counts.chassisList.filter((chassis) => {
			return chassis == unitData.Class;
		}).length >= 3
	) {
		counts.chassis.push(unitData?.class);
	}

	if (unitData.rules == "Experimental" || unitData.rules == "Unknown") {
		counts.rulesLevel.push(unitData.name);
	}
	if (unitData?.abilites?.toLowerCase().includes("dro")) {
		counts.dro.push(unitData.name);
	}
	if (unitData?.abilites?.toLowerCase().includes("jmps")) {
		counts.jmpsTotal += Number(unitData.abilites.match(/JMPS[1-9]/g)[0].charAt(4));
		counts.jmps.push(unitData.name);
	}
	if (unitData.abilities?.toLowerCase().includes("htc")) {
		if (unitData.BFMove[0] == 0) {
			counts.trailer.push(unitData.name);
		} else {
			counts.htc.push(unitData.name);
		}
	}
	if (unit.skill < 2 || unit.skill > 6) {
		counts.skillThreshold.push(unitData.name);
	}
	if (unit.skill == 2 || unit.skill == 6) {
		counts.skillCombination.push(unitData.name);
	}
}

function validateList(counts: any) {
	let issueList: {
		id: string;
		title: string;
		description: string;
		number: string;
		violatingUnits: string;
	}[] = [];
	if (counts.unavailableUnits.length) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Unavailable Units",
			description: "Units are unavailable to the selected faction in the selected era",
			number: `${counts.unavailableUnits.length}`,
			violatingUnits: counts.unavailableUnits.join(", ")
		});
	}
	if (counts.totalPV > 350) {
		issueList.push({
			id: crypto.randomUUID,
			title: "PV",
			description: "List may have a maximum of 350 total PV",
			number: `${counts.totalPV}`,
			violatingUnits: ""
		});
	}
	if (counts.totalUnits > 16) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Total Units",
			description: "Total Units must be equal to or less than 16",
			number: `${counts.totalUnits}`,
			violatingUnits: ""
		});
	}
	if (counts.totalMechs > 12) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Total Mechs",
			description: "Total combined number of Battlemechs and Industrial Mechs must be equal to or less than 12",
			number: `${counts.totalMechs}`,
			violatingUnits: ""
		});
	}
	if (counts.totalCV > 8) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Total Vehicles",
			description: "Total number of combat vehicles must be equal to or less than 8",
			number: `${counts.totalCV}`,
			violatingUnits: ""
		});
	}
	if (counts.totalInf > 5) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Total Infantry",
			description: "Total number of infantry (including BA) must be equal to or less than 5",
			number: `${counts.totalInf}`,
			violatingUnits: ""
		});
	}
	if (counts.totalProto != 0 && counts.totalProto != 5) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Total Protomechs",
			description: "Total number of Protomechs must be equal to 0 or 5",
			number: `${counts.totalProto}`,
			violatingUnits: ""
		});
	}
	if (counts.unallowedTypes.length) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Invalid Unit Types",
			description: "Units must be Battlemechs, Industrial Mechs, Protomechs, Combat Vehicles, or Infantry",
			number: `${counts.unallowedTypes.length}`,
			violatingUnits: counts.unallowedTypes.join(", ")
		});
	}
	if (counts.rulesLevel.length) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Rules",
			description: "Units cannot have experimental or unknown rules",
			number: `${counts.rulesLevel.length}`,
			violatingUnits: counts.rulesLevel.join(", ")
		});
	}
	if (counts.unique.length) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Unique",
			description: "Unit must not be unique in the chosen era",
			number: `${counts.unique.length}`,
			violatingUnits: counts.unique.join(", ")
		});
	}
	if (counts.dro.length) {
		issueList.push({
			id: crypto.randomUUID,
			title: "DRO",
			description: "Units with the DRO special ability are prohibited",
			number: `${counts.dro.length}`,
			violatingUnits: counts.dro.join(", ")
		});
	}
	if (counts.jmpsTotal > 2) {
		issueList.push({
			id: crypto.randomUUID,
			title: "JMPS",
			description: "Combined total of JMPS must be equal to or less than 2",
			number: `${counts.jmps.length}`,
			violatingUnits: counts.jmps.join(", ")
		});
	}
	if (counts.trailer.length > counts.htc.length) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Trailer without Hitch",
			description: "Must have at least as many units with HTC as you have trailered units",
			number: `${counts.trailer.length}/${counts.htc.length}`,
			violatingUnits: counts.trailer
		});
	}
	if (counts.skillThreshold.length) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Skill Threshold",
			description: "Unit Skill is a minimum of 2 and a maximum of 6",
			number: `${counts.skillThreshold.length}`,
			violatingUnits: counts.skillThreshold.join(", ")
		});
	}
	if (counts.skillCombination.length > 2) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Skill Combinations",
			description: "May only have two units at the extremes of the skill range",
			number: `${counts.skillCombination.length}`,
			violatingUnits: counts.skillCombination.join(", ")
		});
	}
	if (counts.chassis.length) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Maximum Chassis",
			description: "You may have a maximum of 2 units with the same chassis",
			number: `${counts.chassis.length}`,
			violatingUnits: counts.chassis.join(", ")
		});
	}
	if (counts.variant.length) {
		issueList.push({
			id: crypto.randomUUID,
			title: "Maximum Variants",
			description: "Each Mech must be a unique variant",
			number: `${counts.variant.length}`,
			violatingUnits: counts.variant.join(", ")
		});
	}
	return issueList;
}
