import { nanoid } from "nanoid";
import type { ListFormation, ListCode, ListCodeUnit, Sublist } from "$lib/types/listTypes";

/**
 * Converts from original json list formatting to v1 json list formatting
 *
 * @param importedList - the list in json format
 * @returns - a listcode in the v1 formatting
 */
export function convertUnversionedJSONList(importedList: any): ListCode {
	let importedUnits: ListCodeUnit[] = [];
	let importedFormations: ListFormation[] = [];
	let importedSublists: Sublist[] = [];

	importedFormations.push({ id: "unassigned", name: "Unassigned units", type: "none", units: [] });

	//convert units and formations to lcv1 formatting
	for (const item of importedList.units) {
		if (item.charAt(0) == "{") {
			const formationData = JSON.parse(item);
			const formationId: string = nanoid(6);
			let formationUnitList: { id: string }[] = [];

			for (const unit of formationData.units) {
				const unitId: string = nanoid(6);
				let [mulId, skill] = unit.split(",");
				if (skill == "undefined") {
					skill = 4;
				}

				importedUnits.push({ id: unitId, mulId, skill, customization: {} });
				formationUnitList.push({ id: unitId });
			}
			importedFormations.push({ id: formationId, name: formationData.name, type: formationData.type, units: formationUnitList });
		} else {
			const unitId = nanoid(6);
			let [mulId, skill] = item.split(",");
			if (skill == "undefined") {
				skill = 4;
			}
			importedUnits.push({ id: unitId, mulId, skill, customization: {} });
			importedFormations[0].units.push({ id: unitId });
		}
	}
	//convert sublist to lcv1 formatting
	for (const sublist of importedList.sublists) {
		const subListData = JSON.parse(sublist);
		const sublistId: string = nanoid(6);
		const scenario: string = subListData.sc;
		const checked = subListData.un.map((unitPos: number) => {
			return importedUnits[unitPos].id;
		});

		importedSublists.push({ id: sublistId, scenario, checked });
	}

	const updatedList: ListCode = {
		id: crypto.randomUUID(),
		name: importedList.name,
		eras: Number(importedList.era) == 0 ? [] : [Number(importedList.era)],
		factions: Number(importedList.faction) == 0 ? [] : [Number(importedList.faction)],
		rules: importedList.rules.name ?? "noRes",
		sublists: importedSublists,
		units: importedUnits,
		formations: importedFormations,
		lcVersion: 1
	};
	console.log("Converted list to lcV1");
	return updatedList;
}
