import { getGeneralList } from "$lib/utilities/bt-utils";
import type { FormationV2 } from "../types/formation";
import type { ListCode, ListCodeUnit } from "../types/listCode";
import type { SublistV2 } from "../types/sublist";

/**
 * Converts from original json list formatting to v1 json list formatting
 *
 * @param importedList - the list in json format
 * @returns - a listcode in the v1 formatting
 */
export function convertUnversionedJSONList(importedList: any): ListCode {
	let importedUnits: ListCodeUnit[] = [];
	let importedFormations: FormationV2[] = [];
	let importedSublists: SublistV2[] = [];

	importedFormations.push({ id: "unassigned", name: "Unassigned units", type: "none", units: [] });

	//convert units and formations to lcv1 formatting
	for (const item of importedList.units) {
		if (item.charAt(0) == "{") {
			const formationData = JSON.parse(item);
			const formationId: string = crypto.randomUUID();
			let formationUnitList: { id: string }[] = [];

			for (const unit of formationData.units) {
				const unitId: string = crypto.randomUUID();
				let [mulId, skill] = unit.split(",");
				if (skill == "undefined") {
					skill = 4;
				}

				importedUnits.push({ id: unitId, mulId, skill, customization: {} });
				formationUnitList.push({ id: unitId });
			}
			importedFormations.push({ id: formationId, name: formationData.name, type: formationData.type, units: formationUnitList });
		} else {
			const unitId = crypto.randomUUID();
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
		const sublistId: string = crypto.randomUUID();
		const scenario: string = subListData.sc;
		const checked = subListData.un.map((unitPos: number) => {
			return importedUnits[unitPos].id;
		});

		importedSublists.push({ id: sublistId, scenario, checked });
	}

	const updatedList: ListCode = {
		id: crypto.randomUUID(),
		name: importedList.name,
		era: Number(importedList.era),
		faction: Number(importedList.faction),
		general: getGeneralList(Number(importedList.era), Number(importedList.faction)),
		rules: importedList.rules.name ?? "noRes",
		sublists: importedSublists,
		units: importedUnits,
		formations: importedFormations,
		lcVersion: 1
	};
	console.log("Converted list to lcV1");
	return updatedList;
}
