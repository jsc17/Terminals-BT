import { type PDFDocumentProxy } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { randomUUID } from "crypto";
import { prisma } from "$lib/server/prisma";
import { getNewSkillCost } from "$lib/utilities/bt-utils";

export async function parsePDF(pdf: PDFDocumentProxy, era: number, faction: number) {
	const page = await pdf.getPage(1);
	const textContent = await page.getTextContent();
	const unitList: { id: string; name: string; skill: number; pv: number; mulId: number; link: string }[] = [];

	for (let index = 12; index < textContent.items.length - 7; index += 9) {
		let tempUnit = {
			id: randomUUID(),
			name: (textContent.items[index] as TextItem).str,
			skill: 0,
			pv: 0,
			mulId: 0,
			link: ""
		};
		if ((textContent.items[index + 1] as TextItem).str != " ") {
			tempUnit.name += " " + (textContent.items[index + 1] as TextItem).str;
			index++;
		}
		tempUnit.skill = Number((textContent.items[index + 4] as TextItem).str);
		tempUnit.pv = Number((textContent.items[index + 6] as TextItem).str);

		let parsedUnit = await prisma.unit.findFirst({
			where: {
				name: tempUnit.name
			}
		});
		if (parsedUnit) {
			tempUnit.mulId = parsedUnit.mulId;
			tempUnit.link = `http://masterunitlist.info/Unit/Details/${parsedUnit.mulId}`;
		}
		unitList.push(tempUnit);
	}
	return unitList;
}

export async function parseTerminal(listCode: string[]) {
	const tempUnits = listCode.map((unit) => {
		const [mulId, skill] = unit.split(",");
		return { mulId, skill };
	});
	const promiseArray = [];
	for (const unit of tempUnits) {
		promiseArray.push(parseUnit(Number(unit.mulId), Number(unit.skill)));
	}
	const unitList: { id: string; name: string; skill: number; pv: number; mulId: number; link: string }[] = await Promise.all(promiseArray);
	return unitList;
}

async function parseUnit(mulId: number, skill: number) {
	const unitDetails = await prisma.unit.findFirst({
		where: {
			mulId
		}
	});
	if (unitDetails) {
		let tempUnit = {
			id: randomUUID(),
			name: unitDetails.name,
			skill: skill,
			pv: getNewSkillCost(skill, unitDetails.pv),
			mulId,
			link: `http://masterunitlist.info/Unit/Details/${mulId}`
		};
		return tempUnit;
	}
	return { id: randomUUID(), name: "Code Error - Unit not found", skill, pv: 0, mulId, link: "" };
}
