import { type FormationType, type FormationV2 } from "$lib/types";
import { formationReferences } from "$lib/data";
import type { List } from "../types/list.svelte";

export function getFormationTypeByName(name: string) {
	let formationReference: FormationType | undefined;

	for (const { formations } of formationReferences as { type: string; formations: FormationType[] }[]) {
		for (const reference of formations) {
			if (reference.name == name) {
				formationReference = reference;
			} else if (reference.variations) {
				for (const variation of reference.variations) {
					if (variation.name == name) {
						formationReference = variation;
					}
				}
			}
		}
		if (formationReference) {
			break;
		}
	}
	return formationReference;
}

export function getFormationStats(formation: FormationV2, list: List) {
	let totalPV = 0,
		totalS = 0,
		totalM = 0,
		totalL = 0,
		totalHealth = 0,
		totalSize = 0,
		totalSkill = 0,
		unitCount = formation.units.length;

	formation.units.forEach((unit) => {
		let unitStats = list.getUnit(unit.id);
		if (unitStats) {
			totalPV += unitStats.cost ?? 0;
			totalS += unitStats.baseUnit.damageS ?? 0;
			totalM += unitStats.baseUnit.damageM ?? 0;
			totalL += unitStats.baseUnit.damageL ?? 0;
			totalHealth += unitStats.baseUnit.health ?? 0;
			totalSize += unitStats.baseUnit.size ?? 0;
			totalSkill += unitStats.skill ?? 0;
		}
	});
	let avgS = 0,
		avgM = 0,
		avgL = 0,
		avgHealth = 0,
		avgSize = 0,
		avgSkill = 0;
	if (unitCount) {
		avgS = Number((totalS / unitCount).toFixed(2));
		avgM = Number((totalM / unitCount).toFixed(2));
		avgL = Number((totalL / unitCount).toFixed(2));
		avgHealth = Number((totalHealth / unitCount).toFixed(2));
		avgSkill = Number((totalSkill / unitCount).toFixed(2));
		avgSize = Number((totalSize / unitCount).toFixed(2));
	}
	return {
		totalPV,
		unitCount,
		totalS,
		totalM,
		totalL,
		totalHealth,
		avgS,
		avgM,
		avgL,
		avgHealth,
		avgSkill,
		avgSize
	};
}
