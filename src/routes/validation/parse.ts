import type { TextContent, TextItem } from "pdfjs-dist/types/src/display/api";
import { writeJsonToFile } from "$lib/utilities/utilities";

export function getUnitDataFromPDF(content: TextContent, metadata: any) {
	if ((content.items[0] as TextItem).str == "Master Unit List - Forces") {
		return { status: "success", data: parseMul(content) };
	} else if (metadata.Creator && metadata.Creator == "Terminal") {
		if (metadata.Keywords.includes("v2")) {
			return { status: "success", data: parseTerminalV2(content, metadata.Keywords) };
		}
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
	return { parsedUnitData: parsedData, parsedBfsData: [] };
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
	return { parsedUnitData: unitData, parsedBfsData: [] };
}

function parseTerminalV2(content: TextContent, keywords: string) {
	const startingIndex = keywords.includes("simple") ? 9 : 16;
	const stepCount = keywords.includes("simple") ? 7 : 13;
	const pvStep = keywords.includes("simple") ? 6 : 12;
	const skillStep = keywords.includes("simple") ? 4 : 10;
	const upperlimit = content.items.findIndex((i) => /^\d+ Unit($|s$)/.test((i as TextItem).str)) - 1;

	const parsedUnitData: { name: string; pv: number; skill: number }[] = [];

	for (let currIndex = startingIndex; currIndex < upperlimit; currIndex += stepCount) {
		if ((content.items[currIndex] as TextItem).fontName.includes("f1")) {
			currIndex += 2;
		}
		let name = (content.items[currIndex] as TextItem).str;
		while (name == "" || name == " ") {
			currIndex++;
			name = (content.items[currIndex] as TextItem).str;
		}
		if ((content.items[currIndex + 1] as TextItem).str != " ") {
			name += " " + (content.items[currIndex + 1] as TextItem).str;
			currIndex++;
		}
		const pv = Number((content.items[currIndex + pvStep] as TextItem).str.split(" ")[0]);
		const skill = Number((content.items[currIndex + skillStep] as TextItem).str);
		parsedUnitData.push({ name: name.trim(), pv, skill });
	}

	const bfsStart = content.items.findIndex((i) => /Battlefield Support/.test((i as TextItem).str));
	const bfsEnd = content.items.findIndex((i) => /^\d+ BFS Selection($|s$)/.test((i as TextItem).str));
	const includesBSP = (content.items[bfsStart + 2] as TextItem).str == "BSP";
	const includesPV = (content.items[bfsStart + (includesBSP ? 4 : 2)] as TextItem).str == "PV";
	const bfsStepCount = 1 + (includesPV ? 2 : 0) + (includesBSP ? 2 : 0);
	const parsedBfsData: { name: string; count: number }[] = [];

	for (let currIndex = bfsStart + bfsStepCount + 1; currIndex < bfsEnd; currIndex += bfsStepCount) {
		if ((content.items[currIndex] as TextItem).str == "") {
			continue;
		}
		let match = (content.items[currIndex] as TextItem).str.match(/^(.*) x(\d+)$/);
		let name = match?.[1]?.trim() ?? `Error: ${(content.items[currIndex] as TextItem).str}`;
		let count = Number(match?.[2]?.trim() ?? 0);
		parsedBfsData.push({ name, count });
	}
	return { parsedUnitData, parsedBfsData };
}
