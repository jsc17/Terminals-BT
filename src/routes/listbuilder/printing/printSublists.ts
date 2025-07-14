import type { ListUnit } from "$lib/types/listTypes";
import { printer } from "$lib/server/printer";
import type { Column, Content, ContentColumns, TDocumentDefinitions } from "pdfmake/interfaces";
import BlobStream, { type IBlobStream } from "blob-stream";

type PrintableSublist = {
	scenario: string;
	pv: number;
	unitList: ListUnit[];
};

const scenarios = [
	"Bunkers",
	"Capture the Flag",
	"Domination",
	"Headhunter",
	"Hold the Line",
	"King of the Hill",
	"Overrun",
	"Stand Up Fight",
	"Pressure Plate",
	"Stranglehold",
	"-"
];

/**
 * @param layout should be horizontal or vertical
 * @param grouped on/off
 */

export function createSublistsPdf(sublists: PrintableSublist[], layout: string, grouped: boolean, name: string): Promise<Blob> {
	const dd: TDocumentDefinitions = {
		pageSize: "LETTER",
		content: [{ text: `${name} sublists:`, style: "header" }, createSublistsBody(sublists, layout, grouped)],
		footer: {
			columns: [{ text: "https://Terminal.tools/listbuilder", fontSize: 8, margin: [25, 0, 0, 25] }]
		},
		defaultStyle: {
			font: "Helvetica",
			fontSize: 8
		},
		styles: {
			header: {
				fontSize: 16,
				bold: true,
				margin: [0, 0, 0, 16]
			},
			verticalRow: {
				marginBottom: 16
			},
			columnHeader: {
				margin: [0, 2, 0, 2],
				bold: true
			},
			unitRow: {
				margin: [0, 1, 0, 1]
			},
			horizontalHeader: {
				margin: [0, 2, 0, 2],
				bold: true,
				fontSize: 10
			},
			horizontalRow: {
				margin: [0, 2, 0, 8],
				lineHeight: 1.25,
				fontSize: 10
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

function createSublistsBody(sublists: PrintableSublist[], layout: string, grouped: boolean): Content {
	let content: Content[] = [];

	if (grouped) {
		const sortedSublists = sublists.sort((a, b) => {
			return scenarios.indexOf(a.scenario) - scenarios.indexOf(b.scenario);
		});
		if (layout == "vertical") {
			createVerticalBody(sortedSublists, content);
		} else {
			createHorizontalBody(sortedSublists, content);
		}
	} else {
		if (layout == "vertical") {
			createVerticalBody(sublists, content);
		} else {
			createHorizontalBody(sublists, content);
		}
	}

	return content;
}

function createVerticalBody(sublists: PrintableSublist[], content: Content[]) {
	while (sublists.length) {
		let row: ContentColumns = { columns: [], style: "verticalRow", columnGap: 10 };
		let rowSublists = sublists.splice(0, 3);
		for (const sublist of rowSublists) {
			let column: Column = { width: "33%", stack: [] };
			column.stack.push({ text: `${sublist.scenario} -  ${sublist.pv} PV - ${sublist.unitList.length} Units`, style: "columnHeader" });
			for (const unit of sublist.unitList) {
				column.stack.push({
					columns: [
						{ width: "80%", text: `(${unit.skill}) ${unit.baseUnit.name}` },
						{ width: "20%", text: `${unit.cost} (${Math.round(unit.cost / 2)})`, alignment: "center" }
					],
					style: "unitRow"
				});
			}
			column.stack.push({
				text: `Health: ${sublist.unitList.reduce((total: number, unit: ListUnit) => {
					return (total += unit.baseUnit.health ?? 0);
				}, 0)}  Size: ${sublist.unitList.reduce((total: number, unit: ListUnit) => {
					return (total += unit.baseUnit.size ?? 0);
				}, 0)}  Damage: ${sublist.unitList.reduce((total: number, unit: ListUnit) => {
					return (total += unit.baseUnit.damageS ?? 0);
				}, 0)}/${sublist.unitList.reduce((total: number, unit: ListUnit) => {
					return (total += unit.baseUnit.damageM ?? 0);
				}, 0)}/${sublist.unitList.reduce((total: number, unit: ListUnit) => {
					return (total += unit.baseUnit.damageL ?? 0);
				}, 0)}`,
				style: "columnHeader"
			});
			row.columns.push(column);
		}
		content.push(row);
	}
}

function createHorizontalBody(sublists: PrintableSublist[], content: Content[]) {
	for (const sublist of sublists) {
		content.push({
			text: `${sublist.scenario} - ${sublist.pv} PV - ${sublist.unitList.length} Units - Health: ${sublist.unitList.reduce((total: number, unit: any) => {
				return (total += unit.baseUnit.health ?? 0);
			}, 0)}  Size: ${sublist.unitList.reduce((total: number, unit: any) => {
				return (total += unit.baseUnit.size ?? 0);
			}, 0)}  Damage: ${sublist.unitList.reduce((total: number, unit: any) => {
				return (total += unit.baseUnit.damageS ?? 0);
			}, 0)}/${sublist.unitList.reduce((total: number, unit: any) => {
				return (total += unit.baseUnit.damageM ?? 0);
			}, 0)}/${sublist.unitList.reduce((total: number, unit: any) => {
				return (total += unit.baseUnit.damageL ?? 0);
			}, 0)}`,
			style: "horizontalHeader"
		});
		content.push({
			text: sublist.unitList
				.map((unit) => {
					return `(${unit.skill}) ${unit.baseUnit.name} - ${unit.cost} (${Math.round(unit.cost / 2)})`;
				})
				.join(", "),
			style: "horizontalRow"
		});
	}
}
