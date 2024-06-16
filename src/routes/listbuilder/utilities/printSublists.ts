import { type PDFFont, type PDFPage } from "pdf-lib";

export function drawListVertical(list: any, page: PDFPage, slot: number, helvetica: PDFFont, helveticaBold: PDFFont) {
	const { width, height } = page.getSize();
	page.setFont(helveticaBold);
	page.drawText(`${list.scenario} - ${list.pv} PV`, {
		x: 30 + (slot % 3) * 185,
		y: height - 50 - Math.floor(slot / 3) * 185,
		size: 10,
		lineHeight: 12,
		maxWidth: 175
	});
	page.setFont(helvetica);
	let i = 0;
	let offset = 0;
	for (const unit of list.unitList) {
		const unitLine = `(${unit.skill}) ${unit.name}`;
		page.drawText(unitLine, {
			x: 30 + (slot % 3) * 185,
			y: height - 62 - 12 * (i + offset) - Math.floor(slot / 3) * 185,
			lineHeight: 10,
			size: 8,
			maxWidth: 125
		});
		page.drawText(`${unit.cost} (${Math.round(unit.cost / 2)})`, { x: 160 + (slot % 3) * 185, y: height - 62 - 12 * (i + offset) - Math.floor(slot / 3) * 185, size: 8 });
		if (unitLine.length >= 33) {
			offset++;
		}
		i++;
	}
}

export function drawListHorizontal(list: any, page: PDFPage, slot: number, helvetica: PDFFont, helveticaBold: PDFFont) {
	const { width, height } = page.getSize();
	page.setFont(helveticaBold);
	page.drawText(`${list.scenario} - ${list.pv} PV`, {
		x: 30,
		y: height - 50 - slot * 60,
		size: 10,
		lineHeight: 12
	});
	page.setFont(helvetica);
	let unitLine = "";
	for (const unit of list.unitList) {
		unitLine += `(${unit.skill}) ${unit.name} - ${unit.cost}(${Math.round(unit.cost / 2)}), `;
	}
	page.drawText(unitLine, { x: 30, y: height - 62 - slot * 60, size: 10, lineHeight: 12, maxWidth: 552 });
}
