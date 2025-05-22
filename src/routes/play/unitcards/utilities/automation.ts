import type { MulUnit, PlayUnit } from "$lib/types/unit";
import { mechTypes, typeIncludes, vTypes } from "./utilities";

export type CritList = { [key: string]: any; engine: number; firecontrol: number; mp: number; weapon: number; destroyed: number; mhit: number; mhalf: number; mimm: number };

export function countCrits(unit: PlayUnit) {
	let currentCrits: CritList = {
		engine: 0,
		firecontrol: 0,
		mp: 0,
		weapon: 0,
		destroyed: 0,
		mhit: 0,
		mhalf: 0,
		mimm: 0
	};
	for (const crit of unit.current.crits) {
		currentCrits[crit.type] += 1;
	}
	return currentCrits;
}

export function calculateArmor(unit: PlayUnit, reference?: MulUnit) {
	return (reference?.armor ?? 0) - unit.current.damage;
}

export function calculateStructure(armorRemaining: number, unit: PlayUnit, reference?: MulUnit) {
	if (armorRemaining < 0) {
		return (reference?.structure ?? 0) + armorRemaining;
	} else {
		return reference?.structure ?? 0;
	}
}

export function calculateFirepower(unit: PlayUnit, reference?: MulUnit) {
	const firePower: { damaged: boolean; m: number; mMin: boolean; l: number; lMin: boolean; e: number; eMin: boolean; s: number; sMin: boolean; ov: number } = {
		damaged: false,
		s: reference?.damageS ?? 0,
		sMin: reference?.damageSMin ?? false,
		m: reference?.damageM ?? 0,
		mMin: reference?.damageMMin ?? false,
		l: reference?.damageL ?? 0,
		lMin: reference?.damageLMin ?? false,
		e: reference?.damageE ?? 0,
		eMin: reference?.damageEMin ?? false,
		ov: reference?.damageOV ?? 0
	};
	for (const crit of unit.current.crits) {
		if (crit.type == "weapon") {
			firePower.damaged = true;
			firePower.s = firePower.s == 0 ? 0 : firePower.s - 1;
			firePower.sMin = false;
			firePower.m = firePower.m == 0 ? 0 : firePower.m - 1;
			firePower.mMin = false;
			firePower.l = firePower.l == 0 ? 0 : firePower.l - 1;
			firePower.lMin = false;
			firePower.e = firePower.e == 0 ? 0 : firePower.e - 1;
			firePower.eMin = false;
			firePower.ov = firePower.ov == 0 ? 0 : firePower.ov - 1;
		}
		if (crit.type == "engine" && reference?.subtype == "CV") {
			firePower.damaged = true;
			firePower.s = Math.floor(firePower.s / 2);
			firePower.sMin = false;
			firePower.m = Math.floor(firePower.m / 2);
			firePower.mMin = false;
			firePower.l = Math.floor(firePower.l / 2);
			firePower.lMin = false;
			firePower.e = Math.floor(firePower.e / 2);
			firePower.eMin = false;
		}
	}

	return firePower;
}

export function calculateSkill(unit: PlayUnit, critCount: CritList, reference?: MulUnit) {
	if (unit.current.heat >= 4) {
		return { ranged: "S" };
	}
	return {
		melee: Number(unit.skill ?? 0) + critCount.firecontrol * 2,
		ranged: Number(unit.skill ?? 0) + unit.current.heat + critCount.firecontrol * 2
	};
}

export function calculateMovement(unit: PlayUnit, reference?: MulUnit) {
	if (unit.current.heat >= 4) {
		return [{ speed: 0, type: "I", tmm: -4, damaged: true }];
	}
	let moveSpeeds: { speed: number; type: string; tmm: number; damaged: boolean }[] = [];
	for (const { speed, type } of reference?.move ?? []) {
		let newSpeed = speed;
		let newTMM = reference?.tmm ?? 0;
		let damaged = false;
		for (const crit of unit.current.crits) {
			switch (crit.type) {
				case "engine":
					if (reference?.subtype == "BM" || reference?.subtype == "IM") {
						break;
					}
				case "mhalf":
				case "mp":
					damaged = true;
					newSpeed = Math.floor(newSpeed / 2);
					newTMM = Math.floor(newTMM / 2);
					break;
				case "mhit":
					damaged = true;
					newSpeed -= 2;
					newTMM--;
					break;
				case "mimm":
					newSpeed = 0;
					newTMM = 0;
			}
		}
		if (type == "j") {
			newTMM++;
		}
		if (type === undefined || type == "") {
			if (unit.current.heat) {
				damaged = true;
				newSpeed = newSpeed - 2 * unit.current.heat;
				if (unit.current.heat >= 2) {
					newTMM--;
				}
			}
		}
		if (newSpeed < 0) {
			newSpeed = 0;
		}
		if (newTMM < 0) {
			newTMM = 0;
		}
		moveSpeeds.push({ speed: newSpeed, type, tmm: newTMM, damaged });
	}
	if (
		!moveSpeeds.filter(({ speed }) => {
			return speed != 0;
		}).length
	) {
		moveSpeeds = [{ speed: 0, type: "I", tmm: -4, damaged: true }];
	}
	return moveSpeeds;
}

export function calculatePhysical(tmm: number, sDamage: number, reference?: MulUnit) {
	const physical: { attackTypeCount: number; standard?: number; melee?: number; charge?: number; am?: number } = {
		attackTypeCount: 0,
		standard: undefined,
		melee: undefined,
		charge: undefined,
		am: undefined
	};

	if (typeIncludes([...mechTypes, "PM"], reference) && !reference?.abilities.includes("MEL")) {
		physical.attackTypeCount++;
		physical.standard = reference?.size;
	}
	if (typeIncludes([...mechTypes, ...vTypes], reference)) {
		physical.attackTypeCount++;
		physical.charge = (reference?.size ?? 0) + Math.floor(tmm / 2);
		physical.charge = physical.charge < 0 ? 0 : physical.charge;
	}
	if (reference?.abilities.includes("MEL")) {
		physical.attackTypeCount++;
		physical.melee = (reference.size ?? 0) + 1;
	}
	if (reference && reference?.abilities.includes("AM")) {
		physical.attackTypeCount++;
		physical.am = sDamage;
	}
	return physical;
}
