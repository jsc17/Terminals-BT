import type { TextContent, TextItem } from "pdfjs-dist/types/src/display/api";
import { writeJsonToFile } from "$lib/utilities/utilities";

export function getUnitDataFromPDF(content: TextContent) {
	// writeJsonToFile(JSON.stringify(content));
	let startingIndex, stepCount, upperlimit;
	if ((content.items[0] as TextItem).str == "Master Unit List - Forces") {
		startingIndex = 12;
		stepCount = 9;
		upperlimit = content.items.length - 7;
	} else {
		console.log("Not MUL List");
		startingIndex = content.items.findIndex((value) => {
			return (value as TextItem).str == "";
		});
		stepCount = 1;
		upperlimit = 1;
	}

	const parsedData: { name: string; pv: number; skill: number }[] = [];

	for (let index = startingIndex; index < upperlimit; index += stepCount) {
		let name = (content.items[index] as TextItem).str;
		if ((content.items[index + 1] as TextItem).str != " ") {
			name += " " + (content.items[index + 1] as TextItem).str;
			index++;
		}
		const pv = Number((content.items[index + 6] as TextItem).str);
		const skill = Number((content.items[index + 4] as TextItem).str);
		parsedData.push({ name, pv, skill });
	}
	return parsedData;
}
