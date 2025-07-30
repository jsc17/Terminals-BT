import { weaponAbilityReference, type UnitAbility } from "$lib/data/abilities";
import type { MulUnit, ListFormation, ListUnit } from "$lib/types/listTypes";
import type { PlayFormation, PlayUnit, PlayList } from "$lib/types/playmode";
import { calculateBonusAmount, getFormationDataFromName } from "./formationUtilities";

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

export function createDamagedAbilityString(ability: UnitAbility, currentCriticals: string[], disabledAbilities: string[], reference: MulUnit) {
	let string = "";
	let turretString = "";
	let damaged = false;
	let disabled = false;

	if (disabledAbilities.includes(ability.name)) {
		disabled = true;
	}

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
			if (critical == "engine" && (reference.subtype == "CV" || reference.subtype == "SV")) {
				damaged = true;
				for (const key of ["v", "vhid", "s", "m", "l", "e"]) {
					if (ability[key]) {
						ability[key] = Math.floor(ability[key] / 2);
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
				if (critical == "engine" && (reference.subtype == "CV" || reference.subtype == "SV")) {
					damaged = true;
					for (const key of ["v", "vhid", "s", "m", "l", "e"]) {
						if (turretAbility[key]) {
							turretAbility[key] = Math.floor(turretAbility[key] / 2);
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
	return { string, damaged, disabled };
}

export function sendListToPlay(formations: ListFormation[], units: ListUnit[]) {
	const playUnits: PlayUnit[] = [];
	for (const unit of units) {
		if (
			formations.find((formation) => {
				return formation.units.find(({ id }) => id == unit.id) || formation.secondary?.units.find(({ id }) => id == unit.id);
			})
		) {
			playUnits.push({
				id: unit.id,
				mulId: unit.baseUnit.mulId.toString(),
				skill: unit.skill,
				cost: unit.cost,
				customization: unit.customization,
				current: { damage: 0, heat: 0, crits: [], disabledAbilities: [] },
				pending: { damage: 0, heat: 0, crits: [] }
			});
		}
	}
	const playFormations: PlayFormation[] = formations
		.filter((formation) => {
			return formation.units.length;
		})
		.map((formation) => {
			const formationDetails = getFormationDataFromName(formation.type);
			return {
				id: formation.id,
				name: formation.name,
				type: formation.type,
				units: formation.units.map(({ id }) => {
					return id;
				}),
				secondary: {
					type: formation.secondary?.type,
					units: formation.secondary?.units.map(({ id }) => {
						return id;
					})
				},
				bonuses: formationDetails?.bonuses
			};
		});
	const playList: PlayList = {
		formations: playFormations,
		units: playUnits
	};

	if (localStorage.getItem("playList")) {
		let overwrite = confirm("Game already in progress, do you wish to overwrite the existing list?");
		if (overwrite) {
			localStorage.setItem("playList", JSON.stringify(playList));
			localStorage.removeItem("playCurrentRound");
			window.open("/play", "_blank")?.focus();
		} else {
			let loadGame = confirm("Do you wish to load the game in progress?");
			if (loadGame) {
				window.open("/play", "_blank")?.focus();
			}
		}
	} else {
		localStorage.setItem("playList", JSON.stringify(playList));
		window.open("/play", "_blank")?.focus();
	}
}

export function getCritNameFromCode(critical: string): string {
	switch (critical) {
		case "destroyed":
			return "Destroyed";
		case "mhit":
			return "-2 MV";
		case "mhalf":
			return "1/2 MV";
		case "mimm":
			return "0 MV";
		default:
			return critical.charAt(0).toUpperCase() + critical.slice(1);
	}
}
