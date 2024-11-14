import { PDFDocument, PDFPage, rgb, PDFImage, StandardFonts, PDFFont } from "pdf-lib";
import { type Unit } from "$lib/types/unit";
import { type Formation } from "$lib/types/formation.svelte";
import fs from "fs/promises";

const positions = [
	{ x: 27, y: 210 },
	{ x: 27, y: 390 },
	{ x: 27, y: 570 },
	{ x: 27, y: 750 },
	{ x: 279, y: 210 },
	{ x: 279, y: 390 },
	{ x: 279, y: 570 },
	{ x: 279, y: 750 }
];
const condensedPositions = [
	{ x: 27, y: 171 },
	{ x: 27, y: 321 },
	{ x: 27, y: 471 },
	{ x: 27, y: 621 },
	{ x: 27, y: 771 },
	{ x: 279, y: 171 },
	{ x: 279, y: 321 },
	{ x: 279, y: 471 },
	{ x: 279, y: 621 },
	{ x: 279, y: 771 }
];

type Rectangle = {
	x: number;
	y: number;
	width: number;
};

type Reference = {
	ability: string;
	name: string;
	page: string;
};

export function drawBasicHeader(listSummary: PDFPage) {
	let pageHeight = listSummary.getHeight();
	let y = pageHeight - 99;
	let rectangles: Rectangle[] = [
		{ x: 76, y, width: 234 },
		{ x: 310, y, width: 108 },
		{ x: 418, y, width: 54 },
		{ x: 472, y, width: 59 }
	];

	rectangles.forEach((rectangle) => {
		listSummary.drawRectangle({
			x: rectangle.x,
			y: rectangle.y,
			width: rectangle.width,
			height: 12,
			color: rgb(170 / 256, 170 / 256, 170 / 256),
			borderWidth: 1,
			borderColor: rgb(0, 0, 0)
		});
	});

	listSummary.drawText("Unit", { x: 79, y: pageHeight - 96, size: 8 });
	listSummary.drawText("Type", { x: 313, y: pageHeight - 96, size: 8 });
	listSummary.drawText("Skill", { x: 421, y: pageHeight - 96, size: 8 });
	listSummary.drawText("PV", { x: 475, y: pageHeight - 96, size: 8 });
}
export function drawDetailedHeader(listSummary: PDFPage) {
	let pageHeight = listSummary.getHeight();
	let y = pageHeight - 99;
	let rectangles: Rectangle[] = [
		{ x: 76, y, width: 225 },
		{ x: 301, y, width: 30 },
		{ x: 331, y, width: 45 },
		{ x: 376, y, width: 45 },
		{ x: 421, y, width: 45 },
		{ x: 466, y, width: 30 },
		{ x: 496, y, width: 35 }
	];

	rectangles.forEach((rectangle) => {
		listSummary.drawRectangle({
			x: rectangle.x,
			y: rectangle.y,
			width: rectangle.width,
			height: 12,
			color: rgb(170 / 256, 170 / 256, 170 / 256),
			borderWidth: 1,
			borderColor: rgb(0, 0, 0)
		});
	});

	listSummary.drawText("Unit", { x: 81, y: pageHeight - 96, size: 8 });
	listSummary.drawText("Type", { x: 306, y: pageHeight - 96, size: 8 });
	listSummary.drawText("Move", { x: 336, y: pageHeight - 96, size: 8 });
	listSummary.drawText("Damage", { x: 381, y: pageHeight - 96, size: 8 });
	listSummary.drawText("Health", { x: 426, y: pageHeight - 96, size: 8 });
	listSummary.drawText("Skill", { x: 471, y: pageHeight - 96, size: 8 });
	listSummary.drawText("PV", { x: 501, y: pageHeight - 96, size: 8 });
}
export function drawSummary(listSummary: PDFPage, lines: number, unitCount: number, listPv: number) {
	let pageHeight = listSummary.getHeight();
	let pageWidth = listSummary.getWidth();
	let rectangles: Rectangle[] = [
		{ x: 76, y: pageHeight - 111 - 12 * lines, width: pageWidth - 162 },
		{ x: 496, y: pageHeight - 111 - 12 * lines, width: 35 }
	];

	rectangles.forEach((rectangle) => {
		listSummary.drawRectangle({
			x: rectangle.x,
			y: rectangle.y,
			width: rectangle.width,
			height: 12,
			color: rgb(170 / 256, 170 / 256, 170 / 256),
			borderWidth: 1,
			borderColor: rgb(0, 0, 0)
		});
	});

	listSummary.drawText(unitCount + " Units", { x: 81, y: pageHeight - 108 - 12 * lines, size: 8 });
	listSummary.drawText(listPv.toString(), { x: 501, y: pageHeight - 108 - 12 * lines, size: 8 });
}
export function drawBasicUnitLine(listSummary: PDFPage, lines: number, unit: Unit) {
	let pageHeight = listSummary.getHeight();
	let y = pageHeight - 111 - 12 * lines;
	let rectangles: Rectangle[] = [
		{ x: 76, y, width: 234 },
		{ x: 310, y, width: 108 },
		{ x: 418, y, width: 54 },
		{ x: 472, y, width: 59 }
	];

	rectangles.forEach((rectangle) => {
		listSummary.drawRectangle({
			x: rectangle.x,
			y: rectangle.y,
			width: rectangle.width,
			height: 12,
			borderWidth: 1,
			borderColor: rgb(0, 0, 0)
		});
	});

	listSummary.drawText(unit.name, { x: 81, y: pageHeight - 108 - 12 * lines, size: 8 });
	listSummary.drawText(unit.subtype, { x: 315, y: pageHeight - 108 - 12 * lines, size: 8 });
	listSummary.drawText((unit.skill ?? "-").toString(), { x: 423, y: pageHeight - 108 - 12 * lines, size: 8 });
	listSummary.drawText(`${unit.cost} (${Math.round(unit.cost / 2)})`, { x: 477, y: pageHeight - 108 - 12 * lines, size: 8 });
}
export function drawDetailedUnitLine(listSummary: PDFPage, lines: number, unit: Unit) {
	let pageHeight = listSummary.getHeight();
	let y = pageHeight - 111 - 12 * lines;
	let rectangles: Rectangle[] = [
		{ x: 76, y, width: 225 },
		{ x: 301, y, width: 30 },
		{ x: 331, y, width: 45 },
		{ x: 376, y, width: 45 },
		{ x: 421, y, width: 45 },
		{ x: 466, y, width: 30 },
		{ x: 496, y, width: 35 }
	];

	rectangles.forEach((rectangle) => {
		listSummary.drawRectangle({
			x: rectangle.x,
			y: rectangle.y,
			width: rectangle.width,
			height: 12,
			borderWidth: 1,
			borderColor: rgb(0, 0, 0)
		});
	});

	let moveString;
	if (unit.move) {
		moveString = "";
		for (const movement of unit.move!) {
			if (moveString != "") {
				moveString += `/`;
			}
			moveString += `${movement.speed}"${movement.type}`;
		}
	}
	listSummary.drawText(unit.name, { x: 81, y: pageHeight - 108 - 12 * lines, size: 8 });
	listSummary.drawText(unit.subtype, { x: 306, y: pageHeight - 108 - 12 * lines, size: 8 });
	listSummary.drawText(moveString ?? "-", { x: 336, y: pageHeight - 108 - 12 * lines, size: 8 });
	let damage = "";
	if (unit.damageS == undefined) {
		damage += "-";
	} else {
		damage += unit.damageS.toString();
		if (unit.damageSMin) {
			damage += "*";
		}
		damage += "/" + unit.damageM;
		if (unit.damageMMin) {
			damage += "*";
		}
		damage += "/" + unit.damageL;
		if (unit.damageLMin) {
			damage += "*";
		}
		damage += " - " + unit.overheat;
	}
	listSummary.drawText(damage.toString(), { x: 381, y: pageHeight - 108 - 12 * lines, size: 8 });
	let health = "";
	if (unit.health == undefined) {
		health = "-";
	} else {
		health = unit.health + " (" + unit.armor + "+" + unit.structure + ")";
	}
	listSummary.drawText(health, { x: 426, y: pageHeight - 108 - 12 * lines, size: 8 });
	listSummary.drawText((unit.skill ?? "-").toString(), { x: 471, y: pageHeight - 108 - 12 * lines, size: 8 });
	listSummary.drawText(`${unit.cost} (${Math.round(unit.cost / 2)})`, { x: 501, y: pageHeight - 108 - 12 * lines, size: 8 });
}
export function drawFormationLine(listSummary: PDFPage, lines: number, formation: Formation) {
	let pageHeight = listSummary.getHeight();
	let y = pageHeight - 111 - 12 * lines;

	listSummary.drawRectangle({
		x: 76,
		y: y,
		width: 455,
		height: 12,
		color: rgb(230 / 256, 230 / 256, 230 / 256),
		borderWidth: 1,
		borderColor: rgb(0, 0, 0)
	});

	listSummary.drawText(`${formation.name} - ${formation.type} formation`, { x: 81, y: pageHeight - 108 - 12 * lines, size: 8 });
}
export async function drawUnitCard(pdf: PDFDocument, page: PDFPage, unit: Unit, index: number) {
	let pageHeight = page.getHeight();
	let slot = index % 8;
	let image: PDFImage;
	let arrayBuffer = new ArrayBuffer(1);

	if (unit.mulId < 0) {
		arrayBuffer = await fs.readFile(`./files/customCardImages/${unit.mulId}.png`);
	} else {
		try {
			arrayBuffer = await fs.readFile(`./files/cached-cards/${unit.mulId}-${unit.skill}.png`);
		} catch (error) {
			const url = `https://masterunitlist.azurewebsites.net/Unit/Card/${unit.mulId}?skill=${unit.skill}`;
			arrayBuffer = await fetch(url).then((res) => res.arrayBuffer());
			console.log(import.meta.dirname);

			// await fs.writeFile(`./files/cached-cards/${unit.mulId}-${unit.skill}.png`, new Uint8Array(arrayBuffer));
		}
	}
	image = await pdf.embedPng(arrayBuffer);
	page.drawImage(image, { x: positions[slot].x, y: pageHeight - positions[slot].y, height: 174, width: 247 });
}
export async function drawCondensedUnitCard(pdf: PDFDocument, page: PDFPage, unit: Unit, index: number) {
	let pageHeight = page.getHeight();
	let slot = index % 10;
	let image: PDFImage;
	let arrayBuffer = new ArrayBuffer(1);

	if (unit.mulId < 0) {
		arrayBuffer = await fs.readFile(`./files/customCardImages/${unit.mulId}.png`);
	} else {
		try {
			arrayBuffer = await fs.readFile(`./files/cached-cards/${unit.mulId}-${unit.skill}.png`);
		} catch (error) {
			const url = `https://masterunitlist.azurewebsites.net/Unit/Card/${unit.mulId}?skill=${unit.skill}`;
			arrayBuffer = await fetch(url).then((res) => res.arrayBuffer());
			// await fs.writeFile(`./files/cached-cards/${unit.mulId}-${unit.skill}.png`, new Uint8Array(arrayBuffer));
		}
	}
	image = await pdf.embedPng(arrayBuffer);
	page.drawImage(image, { x: condensedPositions[slot].x, y: pageHeight - condensedPositions[slot].y, height: 150, width: 213 });
}
export function drawReferences(listSummary: PDFPage, references: Reference[]) {
	let count = 0;
	listSummary.drawText("Ability references:", { x: 86, y: 300, size: 12 });

	for (const reference of references) {
		if (count < 20) {
			listSummary.drawText(`${reference.ability} (${reference.name}, pg.${reference.page})`, { x: 86, y: 288 - 12 * count, size: 8 });
		} else {
			listSummary.drawText(`${reference.ability} (${reference.name}, pg.${reference.page})`, { x: 318, y: 288 - 12 * (count % 20), size: 8 });
		}
		count++;
	}
}
