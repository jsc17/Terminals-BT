import { weaponAbilityReference, type UnitAbility } from "$lib/data/abilities";
import type { MulUnit } from "$lib/types/unit";

export const aeroTypes = ["AF", "CF"];
export const vTypes = ["CV", "SV"];
export const mechTypes = ["BM", "IM"];
export const infTypes = ["CI", "BA"];

export function typeIncludes(typesToCheck: string[], reference?: MulUnit) {
	if (!reference) {
		return false;
	}
	return typesToCheck.includes(reference.subtype);
}

export function createDamagedAbilityString(ability: UnitAbility, currentCriticals: string[], reference: MulUnit) {
	let string = "";
	let turretString = "";
	let damaged = false;

	if (weaponAbilityReference.includes(ability.name)) {
		for (const critical of currentCriticals) {
			if (critical == "weapon") {
				damaged = true;
				for (const key of ["v", "vhid", "s", "m", "l", "e"]) {
					if (ability[key]) {
						ability[key] -= 1;
					}
				}
			}
			if ((critical == "engine" && reference.subtype == "CV") || reference.subtype == "SV") {
				damaged = true;
				for (let value of [ability.v]) {
					if (value) {
						value = Math.floor(value / 2);
					}
				}
			}
		}
	}

	for (const turretAbility of ability.turretAbilities ?? []) {
		if (weaponAbilityReference.includes(turretAbility.name)) {
			for (const critical of currentCriticals) {
				if (critical == "weapon") {
					damaged = true;
					for (const key of ["v", "vhid", "s", "m", "l", "e"]) {
						if (turretAbility[key]) {
							turretAbility[key] -= 1;
						}
					}
				}
				if ((critical == "engine" && reference.subtype == "CV") || reference.subtype == "SV") {
					damaged = true;
					for (let value of [turretAbility.v]) {
						if (value) {
							value = Math.floor(value / 2);
						}
					}
				}
			}
		}
		turretString += `, ${turretAbility.name}`;
		turretString += `${turretAbility.v !== undefined ? `${turretAbility.v != 0 || turretAbility.vmin ? turretAbility.v : "-"}${turretAbility.vmin ? "*" : ""}` : ""}`;
		turretString += `${turretAbility.s !== undefined ? `${turretAbility.s != 0 || turretAbility.smin ? turretAbility.s : "-"}${turretAbility.smin ? "*" : ""}` : ""}`;
		turretString += `${turretAbility.m !== undefined ? `/${turretAbility.m != 0 || turretAbility.mmin ? turretAbility.m : "-"}${turretAbility.mmin ? "*" : ""}` : ""}`;
		turretString += `${turretAbility.l !== undefined ? `/${turretAbility.l != 0 || turretAbility.lmin ? turretAbility.l : "-"}${turretAbility.lmin ? "*" : ""}` : ""}`;
		turretString += `${turretAbility.e !== undefined ? `/${turretAbility.e != 0 || turretAbility.emin ? turretAbility.e : "-"}${turretAbility.emin ? "*" : ""}` : ""}`;
	}
	string += `${ability.name}`;
	string += `${ability.artType ?? ""}`;
	string += `${ability.extracted ?? ""}`;
	string += `${ability.name == "TUR" ? "(" : ""}`;
	string += `${ability.v !== undefined ? `${ability.v != 0 || ability.vmin ? ability.v : "-"}${ability.vmin ? "*" : ""}` : ""}`;
	string += `${ability.s !== undefined ? `${ability.s != 0 || ability.smin ? ability.s : "-"}${ability.smin ? "*" : ""}` : ""}`;
	string += `${ability.m !== undefined ? `/${ability.m != 0 || ability.mmin ? ability.m : "-"}${ability.mmin ? "*" : ""}` : ""}`;
	string += `${ability.l !== undefined ? `/${ability.l != 0 || ability.lmin ? ability.l : "-"}${ability.lmin ? "*" : ""}` : ""}`;
	string += `${ability.e !== undefined ? `/${ability.e != 0 || ability.emin ? ability.e : "-"}${ability.emin ? "*" : ""}` : ""}`;
	if (ability.s == undefined) {
		turretString = turretString.replace(", ", "");
	}
	string += turretString;
	string += `${ability.name == "TUR" ? ")" : ""}`;
	return { string, damaged };
}
