import type { MulUnit } from "$lib/types/listTypes";
import type { PlayUnit } from "$lib/playmode/types";
import { mechTypes, typeIncludes, vTypes } from "$lib/playmode/utilities/playmodeUtilities";

export type CritList = { [key: string]: any; engine: number; firecontrol: number; mp: number; weapon: number; destroyed: number; mhit: number; mhalf: number; mimm: number };

export function countCrits(unit: PlayUnit) {
	let current: CritList = {
		engine: 0,
		firecontrol: 0,
		mp: 0,
		weapon: 0,
		destroyed: 0,
		mhit: 0,
		mhalf: 0,
		mimm: 0
	};

	let pending: CritList = {
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
		current[crit.type] += 1;
	}
	for (const crit of unit.pending.crits) {
		pending[crit.type] += 1;
	}
	return { current, pending };
}

export function calculateHealth(unit: PlayUnit, reference?: MulUnit) {
	const totalArmor = reference?.armor ?? 0;
	const totalStructure = reference?.structure ?? 0;

	let currentArmor = Math.max(totalArmor - unit.current.damage, 0);
	let pendingArmor = Math.max(currentArmor - unit.pending.damage, 0);

	const armorRemaining = { current: currentArmor, pending: pendingArmor };
	const structRemaining = { current: totalStructure, pending: totalStructure };

	const remainingDamage = Math.max(unit.current.damage - totalArmor, 0);
	structRemaining.current = totalStructure - remainingDamage;

	const remainingPending = Math.max(unit.pending.damage - armorRemaining.current, 0);
	structRemaining.pending = structRemaining.current - remainingPending;

	return { armorRemaining, structRemaining };
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
		if ((crit.type == "engine" && reference?.subtype == "CV") || reference?.subtype == "SV") {
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
	//checks for special modifiers (advanced fire control, shield, etc)
	let modifiers = 0;
	//check if industrial mech has Advanced Fire Control
	if (reference?.subtype == "IM" && !reference.abilities.find(({ name }) => name == "AFC")) {
		modifiers++;
	}
	//check if support vehicle has basic fire control, or neither advanced fire control or basic fire control
	if (reference?.subtype == "SV") {
		if (!reference.abilities.find(({ name }) => name == "AFC") || !reference.abilities.find(({ name }) => name == "BFC")) {
			modifiers += 2;
		}
		if (reference.abilities.find(({ name }) => name == "BFC")) {
			modifiers++;
		}
	}
	if (reference?.abilities.find(({ name }) => name == "SHLD")) {
		modifiers++;
	}
	return {
		melee: Number(unit.skill ?? 0) + modifiers + critCount.firecontrol * 2,
		ranged: Number(unit.skill ?? 0) + modifiers + unit.current.heat + critCount.firecontrol * 2
	};
}

export function calculateMovement(unit: PlayUnit, measurementUnits: "inches" | "hexes", reference?: MulUnit) {
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
			newTMM += reference?.abilities.find(({ name }) => name == "JMPS")?.v ?? 0;
			newTMM -= reference?.abilities.find(({ name }) => name == "JMPW")?.v ?? 0;
		}
		if (type == "s") {
			newTMM += reference?.abilities.find(({ name }) => name == "SUBS")?.v ?? 0;
			newTMM -= reference?.abilities.find(({ name }) => name == "SUBW")?.v ?? 0;
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

		if (measurementUnits == "hexes") {
			newSpeed = newSpeed / 2;
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

	if (typeIncludes([...mechTypes, "PM"], reference) && !reference?.abilities.find(({ name }) => name == "MEL")) {
		physical.attackTypeCount++;
		physical.standard = reference?.size;
	}
	if (typeIncludes([...mechTypes, ...vTypes], reference)) {
		physical.attackTypeCount++;
		physical.charge = (reference?.size ?? 0) + Math.floor(tmm / 2);
		physical.charge = physical.charge < 0 ? 0 : physical.charge;
	}
	if (reference?.abilities.find(({ name }) => name == "MEL")) {
		physical.attackTypeCount++;
		physical.melee = (reference.size ?? 0) + 1;
	}
	if (reference && reference?.abilities.find(({ name }) => name == "AM")) {
		physical.attackTypeCount++;
		physical.am = sDamage;
	}
	return physical;
}
