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
		if (unit[1]) {
			const unitLine = `(${unit[0].skill}) ${unit[0].name}`;
			page.drawText(unitLine, {
				x: 30 + (slot % 3) * 185,
				y: height - 62 - 12 * (i + offset) - Math.floor(slot / 3) * 185,
				lineHeight: 10,
				size: 8,
				maxWidth: 130
			});
			page.drawText(`${unit[0].cost} (${Math.round(unit[0].cost / 2)})`, { x: 160 + (slot % 3) * 185, y: height - 62 - 12 * (i + offset) - Math.floor(slot / 3) * 185, size: 8 });
			if (unitLine.length >= 33) {
				offset++;
			}
			i++;
		}
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
		if (unit[1]) {
			unitLine += `(${unit[0].skill}) ${unit[0].name} - ${unit[0].cost}(${Math.round(unit[0].cost / 2)}), `;
		}
	}
	page.drawText(unitLine, { x: 30, y: height - 62 - slot * 60, size: 10, lineHeight: 12, maxWidth: 552 });
}
