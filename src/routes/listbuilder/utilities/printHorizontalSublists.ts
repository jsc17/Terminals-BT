import { PDFDocument, PageSizes, PDFPage, StandardFonts } from "pdf-lib";

export async function printHorizontalSublists(pdf: PDFDocument, orderedSublists: any[]) {
	const [helvetica, helveticaBold] = await Promise.all([pdf.embedFont(StandardFonts.Helvetica), pdf.embedFont(StandardFonts.HelveticaBold)]);
	const pages: PDFPage[] = [];
	let slot = 0;

	for (const sublist of orderedSublists) {
		if (slot / 11 >= pages.length) {
			pages.push(pdf.addPage(PageSizes.Letter));
		}
		let tempSlot = slot % 11;
		let page = pages.at(-1)!;
		let offset = 0;
		const { width, height } = page.getSize();
		page.setFont(helveticaBold);
		page.drawText(
			`${sublist.scenario} - ${sublist.pv} PV - ${sublist.unitList.length} Units - Health: ${sublist.unitList.reduce((total: number, unit: any) => {
				return (total += unit.health ?? 0);
			}, 0)}  Size: ${sublist.unitList.reduce((total: number, unit: any) => {
				return (total += unit.size ?? 0);
			}, 0)}  Damage: ${sublist.unitList.reduce((total: number, unit: any) => {
				return (total += unit.damageS ?? 0);
			}, 0)}/${sublist.unitList.reduce((total: number, unit: any) => {
				return (total += unit.damageM ?? 0);
			}, 0)}/${sublist.unitList.reduce((total: number, unit: any) => {
				return (total += unit.damageL ?? 0);
			}, 0)}`,
			{
				x: 30,
				y: height - 34 - tempSlot * 68,
				size: 10,
				lineHeight: 12
			}
		);
		page.setFont(helvetica);
		let unitLine = "";
		for (const unit of sublist.unitList) {
			unitLine += `(${unit.skill}) ${unit.name} - ${unit.cost}(${Math.round(unit.cost / 2)}), `;
		}
		page.drawText(unitLine, { x: 30, y: height - 48 - tempSlot * 68, size: 10, lineHeight: 12, maxWidth: 550, wordBreaks: [" "] });
		if (helvetica.widthOfTextAtSize(unitLine, 8) / 552 > 4) {
			tempSlot++;
			slot++;
		}
		return slot;
	}
}
