import { scaReferences, spaReferences } from "$lib/data";
import type { ListUnit, SCA, SPA } from "$lib/types/listTypes";

export function getSCAfromId(id: number): SCA | undefined {
	return scaReferences.find((sca) => {
		return sca.id == id;
	});
}

export function getSCAfromName(name: string): SCA | undefined {
	return scaReferences.find((sca) => {
		return sca.name == name;
	});
}

export function getSPAfromId(id: number): SPA | undefined {
	return spaReferences.find((spa) => {
		return spa.id == id;
	});
}

export function getSPAfromName(name: string): SPA | undefined {
	return spaReferences.find((spa) => {
		return spa.name == name;
	});
}

export function calculateListStats(units: ListUnit[]) {
	let totalPV = 0,
		totalS = 0,
		totalM = 0,
		totalL = 0,
		totalHealth = 0,
		totalSize = 0,
		totalSkill = 0,
		unitCount = units.length;

	units.forEach((unit) => {
		if (unit) {
			totalPV += unit.cost ?? 0;
			totalS += unit.baseUnit.damageS ?? 0;
			totalM += unit.baseUnit.damageM ?? 0;
			totalL += unit.baseUnit.damageL ?? 0;
			totalHealth += unit.baseUnit.health ?? 0;
			totalSize += unit.baseUnit.size ?? 0;
			totalSkill += unit.skill ?? 0;
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
