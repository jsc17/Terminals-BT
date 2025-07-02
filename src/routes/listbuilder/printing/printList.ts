import type { TDocumentDefinitions, TableCell, Content, Column } from "pdfmake/interfaces";
import BlobStream, { type IBlobStream } from "blob-stream";
import { abilityReferences, spaReferences, ammoReferences } from "$lib/data/index.js";
import type { ListUnit, ListFormation, SCA } from "$lib/types/listTypes";
import { printer } from "$lib/server/printer";
import { getSCAfromName } from "$lib/utilities/listUtilities";
import { getFormationDataFromName } from "$lib/utilities/formationUtilities";
import { generateUnitCard, loadUnitCardImage } from "./loadUnitCard";
import playwright, { type Browser } from "playwright";
import { getBSCbyId } from "$lib/data/battlefieldSupport";

type PrintableList = {
	units: ListUnit[];
	formations: ListFormation[];
	playername: string;
	listname: string;
	eras: number[];
	factions: number[];
	general: number;
	style: "mul" | "detailed";
	cardStyle: "mul" | "generated";
	condensed: boolean;
	scas: SCA[];
	bs: number[];
};

function createUnitLine(unit: ListUnit, listStyle: string, indent: boolean) {
	let unitLine: TableCell[] = [];
	const style = indent ? "cellIndented" : "cell";
	if (listStyle == "mul") {
		unitLine = [
			{ text: unit.baseUnit.name, style: style },
			{ text: unit.baseUnit.subtype, style: "cellCentered" },
			{ text: unit.skill?.toString() ?? "-", style: "cellCentered" },
			{ text: `${unit.cost} (${Math.round(unit.cost / 2)})`, style: "cellCentered" }
		];
	} else {
		let moveString = "-";
		if (unit.baseUnit.move) {
			moveString = "";
			for (const movement of unit.baseUnit.move) {
				moveString += `${movement.speed}"${movement.type ?? ""}/`;
			}
			moveString = moveString.replace(/\/$/gm, "");
		}
		let damageString =
			unit.baseUnit.damageS == undefined
				? "-"
				: `${unit.baseUnit.damageS}${unit.baseUnit.damageSMin ? "*" : ""}/${unit.baseUnit.damageM}${unit.baseUnit.damageMMin ? "*" : ""}/${unit.baseUnit.damageL}${unit.baseUnit.damageLMin ? "*" : ""}`;
		let healthString = unit.baseUnit.health == undefined ? "-" : `${unit.baseUnit.health} (${unit.baseUnit.armor}a+${unit.baseUnit.structure}s)`;
		unitLine = [
			{ text: unit.baseUnit.name, style: style },
			{ text: unit.baseUnit.subtype, style: "cellCentered" },
			{ text: moveString, style: "cellCentered" },
			{ text: damageString, style: "cellCentered" },
			{ text: healthString, style: "cellCentered" },
			{ text: unit.skill?.toString() ?? "-", style: "cellCentered" },
			{ text: `${unit.cost} (${Math.round(unit.cost / 2)})`, style: "cellCentered" }
		];
	}
	return unitLine;
}

function createUnitTable(listStyle: string, unitList: ListUnit[], formations: ListFormation[], drawFormations: boolean): TableCell[][] {
	let unitTable: TableCell[][] = [];
	let unitCount = 0;
	let totalPV = 0;
	const headerLength = listStyle == "mul" ? 4 : 7;

	for (const formation of formations) {
		let formationPV = 0;
		const formationUnitLines = [];
		for (const unitId of formation.units) {
			const unit = unitList.find((unit) => {
				return unit.id == unitId.id;
			})!;
			unitCount++;
			totalPV += unit.cost;
			formationPV += unit.cost;
			formationUnitLines.push(createUnitLine(unit, listStyle, drawFormations));
		}
		if (drawFormations && formation.id != "unassigned") {
			unitTable.push([
				{
					text: `${formation.name} - ${formation.type} formation - ${formation.units.length} Units - ${formationPV} PV`,
					colSpan: headerLength,
					style: "formationHeader"
				}
			]);
		}
		unitTable = unitTable.concat(formationUnitLines);
		if (drawFormations && formation.secondary) {
			let secondaryPv = 0;
			const secondaryUnitLines = [];
			for (const unitId of formation.secondary.units) {
				const unit = unitList.find((unit) => {
					return unit.id == unitId.id;
				})!;
				unitCount++;
				totalPV += unit.cost;
				secondaryPv += unit.cost;
				secondaryUnitLines.push(createUnitLine(unit, listStyle, drawFormations));
			}
			unitTable.push([
				{
					text: `${formation.name} - ${formation.secondary.type} formation - ${formation.secondary.units.length} Units - ${secondaryPv} PV`,
					colSpan: headerLength,
					style: "formationHeader"
				}
			]);
			unitTable = unitTable.concat(secondaryUnitLines);
		}
	}
	unitTable.push([
		{ text: `${unitCount} Units`, colSpan: headerLength - 1, style: "cellHeader" },
		...Array(headerLength - 2).fill(""),
		{ text: totalPV, style: "cellHeaderCentered" }
	]);
	return unitTable;
}

function createBattlefieldSupportTable(supportList: number[]) {
	let supportTable: TableCell[][] = [];
	let totalBSP = 0;

	supportTable.push([
		{ text: `Battlefield Support`, style: "cellHeader" },
		{ text: `BSP Cost`, style: "cellHeaderCentered" }
	]);

	for (const supportId of supportList) {
		const support = getBSCbyId(supportId);
		totalBSP += support?.bspCost ?? 0;
		supportTable.push([{ text: support?.name }, { text: support?.bspCost, style: "cellCentered" }]);
	}

	supportTable.push([
		{ text: ``, style: "cellHeader" },
		{ text: totalBSP, style: "cellHeaderCentered" }
	]);
	return supportTable;
}

function createReferenceList(units: ListUnit[], formations: ListFormation[]) {
	const referenceColumns: Column[] = [];
	const abilityReferenceList = new Set();
	const spaReferenceList = new Set();
	const ammoReferenceList = new Set();
	const formationReferenceList = new Set();
	const scaReferenceList = new Set();

	formations.forEach((formation) => {
		if (formation.type == "none") {
			return;
		}
		let formationReference = getFormationDataFromName(formation.type);

		formationReference?.referencedSPAs?.forEach((spa) => {
			let spaReference = spaReferences.find(({ name }) => {
				return name.toLocaleLowerCase() == spa.toLocaleLowerCase();
			});
			if (spaReference != undefined) {
				spaReferenceList.add(spaReference);
			} else {
				spaReferenceList.add({ name: spa, cost: 0, page: "Not Found" });
			}
		});
		formationReference?.referencedSCAs?.forEach((sca) => {
			const scaReference = getSCAfromName(sca);
			if (scaReference) {
				scaReferenceList.add(scaReference);
			}
		});
		if (formationReference != undefined) {
			formationReferenceList.add(formationReference);
		} else {
			formationReferenceList.add({ name: formation.type, page: "Not Found" });
		}
	});
	units.forEach((unit) => {
		abilityReferences.forEach((reference) => {
			if (unit.baseUnit.abilities.find(({ name }) => name == reference.abbr)) {
				abilityReferenceList.add(reference);
			}
		});
		unit.customization?.spa?.forEach((spa) => {
			let spaReference = spaReferences.find(({ name }) => {
				return name.toLocaleLowerCase() == spa.toLocaleLowerCase();
			});
			if (spaReference != undefined) {
				spaReferenceList.add(spaReference);
			} else {
				spaReferenceList.add({ name: spa, cost: 0, page: "Not Found" });
			}
		});
		unit.customization?.ammo?.forEach((ammo) => {
			let ammoReference: any;
			ammoReferences.forEach(({ ammoTypes }) => {
				if (ammoReference == undefined) {
					ammoReference = ammoTypes.find(({ name }) => {
						return ammo == name;
					});
				}
			});
			if (ammoReference != undefined) {
				ammoReferenceList.add(ammoReference);
			} else {
				ammoReferenceList.add({ name: ammo, page: "Not Found" });
			}
		});
	});
	const abilityReferenceLines = [...abilityReferenceList]
		.map((reference: any) => {
			return `${reference.abbr} (${reference.name}, pg.${reference.page})`;
		})
		.sort()
		.map((reference: any) => {
			return { text: reference, style: "listItem" };
		});
	referenceColumns.push({ columns: [{ text: "Abilities:", style: "referenceSectionHeader" }] });
	referenceColumns.push({
		columns: [{ ul: abilityReferenceLines.slice(0, Math.ceil(abilityReferenceLines.length / 2)) }, { ul: abilityReferenceLines.slice(Math.ceil(abilityReferenceLines.length / 2)) }]
	});
	if (spaReferenceList.size != 0) {
		referenceColumns.push({ columns: [{ text: "SPAs:", style: "referenceSectionHeader" }] });
		const spaReferenceLines = [...spaReferenceList]
			.map((reference: any) => {
				return `${reference.name} (pg.${reference.page})`;
			})
			.sort()
			.map((reference: any) => {
				return { text: reference, style: "listItem" };
			});
		referenceColumns.push({
			columns: [{ ul: spaReferenceLines.slice(0, Math.ceil(spaReferenceLines.length / 2)) }, { ul: spaReferenceLines.slice(Math.ceil(spaReferenceLines.length / 2)) }]
		});
	}
	if (ammoReferenceList.size != 0) {
		referenceColumns.push({ columns: [{ text: "Alt. Ammo:", style: "referenceSectionHeader" }] });
		const ammoReferenceLines = [...ammoReferenceList]
			.map((reference: any) => {
				return `${reference.name} (pg.${reference.page})`;
			})
			.sort()
			.map((reference: any) => {
				return { text: reference, style: "listItem" };
			});
		referenceColumns.push({
			columns: [{ ul: ammoReferenceLines.slice(0, Math.ceil(ammoReferenceLines.length / 2)) }, { ul: ammoReferenceLines.slice(Math.ceil(ammoReferenceLines.length / 2)) }]
		});
	}
	if (formationReferenceList.size != 0) {
		referenceColumns.push({ columns: [{ text: "Formations:", style: "referenceSectionHeader" }] });
		const formationReferenceLines = [...formationReferenceList]
			.map((reference: any) => {
				return `${reference.name} (${reference.page})`;
			})
			.sort()
			.map((reference: any) => {
				return { text: reference, style: "listItem" };
			});
		referenceColumns.push({
			columns: [
				{ ul: formationReferenceLines.slice(0, Math.ceil(formationReferenceLines.length / 2)) },
				{ ul: formationReferenceLines.slice(Math.ceil(formationReferenceLines.length / 2)) }
			]
		});
	}
	if (scaReferenceList.size != 0) {
		referenceColumns.push({ columns: [{ text: "SCAs from Formations:", style: "referenceSectionHeader" }] });
		const scaReferenceLines = [...scaReferenceList]
			.map((reference: any) => {
				return `${reference.name} (${reference.page})`;
			})
			.sort()
			.map((reference: any) => {
				return { text: reference, style: "listItem" };
			});
		referenceColumns.push({
			columns: [{ ul: scaReferenceLines.slice(0, Math.ceil(scaReferenceLines.length / 2)) }, { ul: scaReferenceLines.slice(Math.ceil(scaReferenceLines.length / 2)) }]
		});
	}
	return referenceColumns;
}

async function loadUnitFormation(formation: ListFormation, units: ListUnit[], cardStyle: string, browser: Browser) {
	let unitPromises: Promise<string>[] = [];
	let formationData: { name: string; type: string; pv: number; unitcards: string[] } = { name: formation.name, type: formation.type, pv: 0, unitcards: [] };

	let formationUnits: ListUnit[] = formation.units.map(({ id }) => units.find((unit) => unit.id == id)).filter((result) => result != undefined);

	if (cardStyle == "mul") {
		for (const unit of formationUnits) {
			unitPromises.push(loadUnitCardImage(unit.baseUnit.mulId, unit.skill));
			formationData.pv += unit.cost;
		}
	} else {
		for (const unit of formationUnits) {
			unitPromises.push(generateUnitCard(unit, browser));
			formationData.pv += unit.cost;
		}
	}

	formationData.unitcards = await Promise.all(unitPromises);
	return formationData;
}

async function createUnitCardColumns(unitList: ListUnit[], formationList: ListFormation[], printByFormation: boolean, cardStyle: string) {
	let formationPromises: Promise<{ name: string; type: string; pv: number; unitcards: string[] }>[] = [];

	const browser = await playwright.chromium.launch({ headless: true });

	for (const formation of formationList) {
		formationPromises.push(loadUnitFormation(formation, unitList, cardStyle, browser));
		if (formation.secondary) {
			const secondaryFormation = { id: "", name: `${formation.name} ${formation.secondary.type}`, type: formation.secondary.type, units: formation.secondary.units };
			formationPromises.push(loadUnitFormation(secondaryFormation, unitList, cardStyle, browser));
		}
	}

	let formationsToPrint = await Promise.all(formationPromises);

	if (!printByFormation) {
		formationsToPrint = [
			formationsToPrint.reduce(
				(combinedFormation, formation) => {
					return {
						name: combinedFormation.name,
						type: combinedFormation.type,
						pv: combinedFormation.pv + formation.pv,
						unitcards: combinedFormation.unitcards.concat(formation.unitcards)
					};
				},
				{ name: "list", type: "none", pv: 0, unitcards: [] }
			)
		];
	}

	const unitCardColumns: Content[] = [];
	formationsToPrint.forEach((formation) => {
		unitCardColumns.push({
			text: printByFormation && formation.type != "none" ? `${formation.name} - ${formation.type} formation - ${formation.unitcards.length} units - ${formation.pv}pv` : "",
			style: "subheader",
			headlineLevel: 1
		});

		const unitCards: { image: any; width: number }[] = [];
		for (const unitCard of formation.unitcards) {
			unitCards.push({ image: unitCard, width: 250 });
		}
		unitCardColumns.push({
			columns: [
				unitCards.filter((v, i) => {
					return i % 2 == 0;
				}),
				unitCards.filter((v, i) => {
					return i % 2 == 1;
				})
			],
			columnGap: 10
		});
	});
	return unitCardColumns;
}

function createSCAColumns(scas: SCA[]) {
	const referenceColumns: Column[] = [];

	const scaReferenceLines = scas
		.map((reference: any) => {
			return `${reference.name} (${reference.page})`;
		})
		.sort()
		.map((reference: any) => {
			return { text: reference, style: "listItem" };
		});
	referenceColumns.push({
		columns: [{ ul: scaReferenceLines.slice(0, Math.ceil(scaReferenceLines.length / 2)) }, { ul: scaReferenceLines.slice(Math.ceil(scaReferenceLines.length / 2)) }]
	});
	return referenceColumns;
}

export async function printList(list: PrintableList, drawFormations: boolean, printUnitsByFormation: boolean): Promise<Blob> {
	const tableheaders: TableCell[] =
		list.style == "mul"
			? [{ text: "Unit", style: "cellHeader" }].concat(
					["Type", "Skill", "PV"].map((header) => {
						return { text: header, style: "cellHeaderCentered" };
					})
				)
			: [{ text: "Unit", style: "cellHeader" }].concat(
					["Type", "Move", "Damage", "Health", "Skill", "PV"].map((header) => {
						return { text: header, style: "cellHeaderCentered" };
					})
				);
	const tableWidths = list.style == "mul" ? ["*", "auto", "auto", "auto"] : ["*", "auto", "auto", "auto", "auto", "auto", "auto"];
	const unitTable = createUnitTable(list.style, list.units, list.formations, drawFormations);
	const referenceColumns = createReferenceList(list.units, list.formations);
	const unitCardColumns = await createUnitCardColumns(list.units, list.formations, printUnitsByFormation, list.cardStyle);
	const bsTable = createBattlefieldSupportTable(list.bs);

	let scaSection: Content[] = [];
	if (list.scas.length) {
		scaSection.push({ text: "Special Command Abilities", style: "subheader", headlineLevel: 1 });
		scaSection.push(createSCAColumns(list.scas));
	}

	const dd: TDocumentDefinitions = {
		pageSize: "LETTER",
		pageMargins: [30, 10],
		pageBreakBefore: (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) => {
			if (currentNode.headlineLevel == 1 && followingNodesOnPage.length == 0) {
				return true;
			}
			return false;
		},
		content: [
			{
				columns: [
					{ text: list.listname, style: "header" },
					{ text: list.playername, style: "player" }
				],
				columnGap: 10
			},
			{
				table: {
					headerRows: 1,
					widths: tableWidths,
					body: [tableheaders, ...unitTable]
				}
			},
			{ text: "", marginTop: 4 },
			list.bs.length
				? {
						table: { headerRows: 1, widths: ["*", "auto"], body: bsTable }
					}
				: { text: "" },
			...scaSection,
			{ text: "References:", style: "subheader" },
			...referenceColumns,
			{ text: "", pageBreak: "after" },
			...unitCardColumns
		],
		// footer: {
		// 	columns: [{ text: "https://Terminal.tools/listbuilder", fontSize: 8, margin: [25, 0, 0, 25] }]
		// },
		defaultStyle: {
			font: "Helvetica",
			fontSize: 8
		},
		styles: {
			header: {
				fontSize: 16,
				bold: true,
				margin: [4, 0, 0, 10]
			},
			subheader: {
				fontSize: 12,
				bold: true,
				margin: [0, 4, 0, 4]
			},
			player: {
				fontSize: 12,
				margin: [0, 0, 10, 10],
				alignment: "right"
			},
			details: {
				margin: [16, 0, 0, 6]
			},
			cellHeader: {
				margin: [0, 1, 0, 0],
				fillColor: "#AAAAAA",
				bold: true
			},
			cellHeaderCentered: {
				margin: [0, 1, 0, 0],
				fillColor: "#AAAAAA",
				alignment: "center",
				bold: true
			},
			cell: {
				margin: [2, 1, 0, 0]
			},
			cellIndented: {
				margin: [12, 1, 0, 0]
			},
			cellCentered: {
				margin: [2, 1, 0, 0],
				alignment: "center"
			},
			formationHeader: {
				margin: [2, 1, 0, 0],
				fillColor: "#e6e6e6"
			},
			referenceSectionHeader: {
				margin: [0, 2],
				bold: true
			},
			listItem: {
				margin: [0, 2]
			}
		}
	};

	return new Promise((resolve, reject) => {
		const pdfDoc = printer.createPdfKitDocument(dd);
		pdfDoc
			.pipe(BlobStream())
			.on("finish", function (this: IBlobStream) {
				resolve(this.toBlob("application/pdf"));
			})
			.on("error", (err) => {
				console.error("err", err);
				reject(err);
			});
		pdfDoc.end();
	});
}
