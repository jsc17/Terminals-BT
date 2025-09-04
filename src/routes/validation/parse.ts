import type { TextContent, TextItem } from "pdfjs-dist/types/src/display/api";
import { writeJsonToFile } from "$lib/utilities/utilities";

export function getUnitDataFromPDF(content: TextContent, metadata: any) {
	if ((content.items[0] as TextItem).str == "Master Unit List - Forces") {
		return { status: "success", data: parseMul(content) };
	} else if (metadata.Creator && metadata.Creator == "Terminal") {
		return { status: "success", data: parseTerminal(content, metadata.Keywords) };
	} else {
		return { status: "failed" };
	}
}

function parseMul(content: TextContent) {
	let startingIndex, stepCount, upperlimit;

	startingIndex = 12;
	stepCount = 9;
	upperlimit = content.items.length - 7;

	const parsedData: { name: string; pv: number; skill: number }[] = [];

	for (let currIndex = startingIndex; currIndex < upperlimit; currIndex += stepCount) {
		let name = (content.items[currIndex] as TextItem).str;
		if ((content.items[currIndex + 1] as TextItem).str != " ") {
			name += " " + (content.items[currIndex + 1] as TextItem).str;
			currIndex++;
		}
		const pv = Number((content.items[currIndex + 6] as TextItem).str);
		const skill = Number((content.items[currIndex + 4] as TextItem).str);
		parsedData.push({ name, pv, skill });
	}
	return parsedData;
}

function parseTerminal(content: TextContent, style: "mul" | "detailed") {
	const startingIndex =
		content.items.findIndex((value) => {
			const { str, transform } = value as TextItem;
			return str == "PV" && transform[5] == "748.456";
		}) + 2;
	const endingIndex =
		content.items.findIndex((value) => {
			const { str, transform } = value as TextItem;
			return str == "Units" && transform[5] < "748.456";
		}) - 3;

	let unitItems = content.items.splice(startingIndex, endingIndex - startingIndex + 1).filter((value) => {
		return "str" in value;
	});

	let nextIndex = unitItems.findIndex((value) => {
		return (value as TextItem).hasEOL;
	});
	const unitLines: TextItem[][] = [];
	while (nextIndex != endingIndex && nextIndex != -1) {
		const nextLine = unitItems.splice(0, nextIndex + 1);
		unitLines.push(nextLine);
		nextIndex = unitItems.findIndex((value) => {
			return (value as TextItem).hasEOL;
		});
	}
	const unitData: { name: string; pv: number; skill: number }[] = [];
	for (const chunk of unitLines) {
		const name = chunk
			.slice(0, style == "detailed" ? -17 : -9)
			.map((value) => value.str)
			.join("");
		const pv = Number(chunk.at(-4)?.str);
		const skill = Number(chunk.at(-6)?.str);
		unitData.push({ name, pv, skill });
	}
	return unitData;
}
