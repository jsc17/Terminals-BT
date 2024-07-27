import { PDFDocument, PageSizes, PDFPage, StandardFonts } from "pdf-lib";

export async function printVerticalSublists(pdf: PDFDocument, orderedSublists: any[]) {
	const [helvetica, helveticaBold] = await Promise.all([pdf.embedFont(StandardFonts.Helvetica), pdf.embedFont(StandardFonts.HelveticaBold)]);
	const pages: PDFPage[] = [];
	let slot = 0;

	for (const sublist of orderedSublists) {
		if (Math.floor(slot / 9) >= pages.length) {
			pages.push(pdf.addPage(PageSizes.Letter));
		}
		console.log(pages.length);
		let page = pages.at(-1)!;
		let tempSlot = slot % 9;
		const { height } = page.getSize();

		page.setFont(helveticaBold);
		page.drawText(`${sublist.scenario} - ${sublist.pv} PV - ${sublist.unitList.length} Units`, {
			x: 30 + (tempSlot % 3) * 185,
			y: height - 32 - Math.floor(tempSlot / 3) * 250,
			size: 10,
			lineHeight: 12,
			maxWidth: 175
		});
		page.setFont(helvetica);
		let i = 0;
		let offset = 0;
		for (const unit of sublist.unitList) {
			const unitLine = `(${unit.skill}) ${unit.name}`;
			page.drawText(unitLine, {
				x: 30 + (tempSlot % 3) * 185,
				y: height - 46 - 11 * i - 9 * offset - Math.floor(tempSlot / 3) * 250,
				lineHeight: 10,
				size: 8,
				maxWidth: 125,
				wordBreaks: [" "]
			});
			page.drawText(`${unit.cost} (${Math.round(unit.cost / 2)})`, {
				x: 160 + (tempSlot % 3) * 185,
				y: height - 46 - 11 * i - 9 * offset - Math.floor(tempSlot / 3) * 250,
				size: 8
			});

			offset += Math.floor(helvetica.widthOfTextAtSize(unitLine, 8) / 125);
			i++;
			if (offset * 9 + i * 11 > 200) {
				tempSlot++;
				i = 0;
				offset = 0;
				slot++;
			}
			if (tempSlot == 9) {
				pages.push(pdf.addPage(PageSizes.Letter));
				page = pages.at(-1)!;
				tempSlot = 0;
			}
		}
		page.setFont(helveticaBold);
		console.log("test");
		page.drawText(
			`Health: ${sublist.unitList.reduce((total: number, unit: any) => {
				console.log(unit.health);
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
				x: 30 + (tempSlot % 3) * 185,
				y: height - 50 - 11 * i - 9 * offset - Math.floor(tempSlot / 3) * 250,
				size: 8
			}
		);
	}
}
