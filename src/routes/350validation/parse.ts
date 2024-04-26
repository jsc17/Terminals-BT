import { type PDFDocumentProxy } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import fs from "fs/promises";
import { randomUUID } from "crypto";

export async function parsePDF(pdf: PDFDocumentProxy, era: number, faction: number) {
	const page = await pdf.getPage(1);
	const textContent = await page.getTextContent();
	const unitList: { id: string; name: string; skill: number; pv: number; mulId: number; link: string }[] = [];
	const fileList = await fs.readdir(`./files/cached`);
	const index = fileList.findIndex((fileName) => {
		let parts = fileName.split("-");
		return parseInt(parts[0]) == era && parseInt(parts[1]) == faction;
	});
	const cachedFile = JSON.parse((await fs.readFile(`./files/cached/${fileList[index]}`)).toString());

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
		let parsedUnit = cachedFile.Units.find((unit: any) => {
			return unit.Name.trim() == tempUnit.name;
		});
		if (parsedUnit) {
			tempUnit.mulId = parsedUnit.Id;
			tempUnit.link = `http://masterunitlist.info/Unit/Details/${parsedUnit.Id}`;
		}
		unitList.push(tempUnit);
	}
	return unitList;
}
