import { form, query } from "$app/server";
import { getGeneralId } from "$lib/remote/era-faction.remote";
import { getMULDataFromName, isAvailable, isUnique } from "$lib/remote/unit.remote";
import type { MulUnit } from "$lib/types/listTypes";
import { getDocument } from "pdfjs-dist";
import { getUnitDataFromPDF } from "./parse";

export type ValidationUnitData = {
	id: string;
	name: string;
	mulData?: MulUnit;
	available?: boolean;
	unique?: boolean;
	skill: number;
	pv: number;
	link?: string;
};

export const getUnitData = form(async (data) => {
	const fileData = data.get("listFile") as File;
	const era = Number(data.get("selectedEra")?.toString());
	const faction = Number(data.get("selectedFaction")?.toString());
	let unitData: ValidationUnitData[] = [];

	const buffer = await fileData.arrayBuffer();
	const pdf = await getDocument(buffer).promise;
	const page = await pdf.getPage(1);
	const content = await page.getTextContent();

	const parsedData = getUnitDataFromPDF(content);

	for (const parsedUnit of parsedData) {
		const unit = await getMULDataFromName(parsedUnit.name);

		let unique: boolean | undefined, available: boolean | undefined;
		if (unit) {
			unique = await isUnique({ mulId: unit.mulId, era });
			const general = (await getGeneralId({ era, faction }))?.general;
			available = await isAvailable({ mulId: unit.mulId, eras: [era], factions: [faction, general ?? 0] });
		}

		unitData.push({
			id: crypto.randomUUID(),
			name: parsedUnit.name,
			skill: parsedUnit.skill,
			pv: parsedUnit.pv,
			mulData: unit,
			link: unit ? `http://masterunitlist.info/Unit/Details/${unit.mulId}` : undefined,
			unique: unique,
			available: available
		});
	}
	await nothing().refresh();
	return unitData;
});

export const getPossibleUnitList = form(async (data) => {
	const searchTerm = data.get("searchTerm")?.toString();
	const results = await prisma.unit.findMany({ where: { name: { contains: searchTerm } }, select: { mulId: true, name: true } });

	await nothing().refresh();
	return results;
});

export const nothing = query(async () => {});
