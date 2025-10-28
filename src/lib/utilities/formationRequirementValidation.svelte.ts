import type { ListFormation, List, ListUnit } from "$lib/types/list.svelte";
import { getFormationDataFromName } from "$lib/utilities/formationUtilities";

export function validateFormation(formation: ListFormation, list: List) {
	const units: ListUnit[] = [];
	for (const unitId of formation.units) {
		const unit = list.getUnit(unitId.id);
		if (unit) {
			units.push(unit);
		}
	}

	const primaryRequirements: { requirement: string; met: number }[] = [];
	let primaryResults: { valid: boolean; requirements: { requirement: string; alternate?: string; met: number }[] };

	const formationData = getFormationDataFromName(formation.type);

	if (formationData !== undefined) {
		if (formationData.secondary) {
			primaryRequirements.push({
				requirement: "This formation type should be added as a secondary on the formation it is attached to in order to evaluate requirements and bonuses correctly",
				met: 0
			});
		}
		//check for ideal role
		let idealMet = false;
		if (formationData?.ideal) {
			idealMet = units.length != 0 && units.filter((unit) => unit.baseUnit.role == formationData.ideal).length == units.length;
			primaryRequirements.push({
				requirement: `Ideal Role: ${formationData.ideal}`,
				met: idealMet ? 1 : 0
			});
		}
		//check if minimum unit count is defined by formation, or default to 3 units if not.
		if (formationData.minimumUnits != 0) {
			primaryRequirements.push({
				requirement: `Formation must have at least ${formationData?.minimumUnits ?? 3} units`,
				met: units.length >= (formationData.minimumUnits ?? 3) ? 1 : -1
			});
		}
		if (formationData.maximumUnits) {
			primaryRequirements.push({
				requirement: `Formation must have at most ${formationData.maximumUnits} units`,
				met: units.length <= formationData?.maximumUnits ? 1 : -1
			});
		}
		if (!formationData.requirements || formationData.requirements.length == 0) {
			primaryRequirements.push({ requirement: "No additional Requirements", met: 0 });
			primaryResults = { valid: units.length >= (formationData?.minimumUnits ?? 3), requirements: primaryRequirements };
		} else {
			//loop through and process requirements
			for (const requirement of formationData.requirements ?? []) {
				let amount = "amount" in requirement ? (requirement.flatAmount ? requirement.amount : units.length * requirement.amount) : 0;
				switch (requirement.type) {
					case "Size":
						primaryRequirements.push({ requirement: requirement.description, met: checkSize(units, requirement.size, requirement.limit, amount) });
						break;
					case "Role":
						const alternateAmount = requirement.alternateFlatAmount ? requirement.alternateAmount : units.length * (requirement.alternateAmount ?? 0);
						primaryRequirements.push({
							requirement: requirement.description,
							met: checkRoles(units, requirement.roles, amount, requirement.alternateRoles, alternateAmount)
						});
						break;
					case "Armor":
						primaryRequirements.push({ requirement: requirement.description, met: checkArmor(units, requirement.armor, amount) });
						break;
					case "Damage":
						primaryRequirements.push({ requirement: requirement.description, met: checkDamage(units, requirement.damage, requirement.range, requirement.limit, amount) });
						break;
					case "Movement":
						primaryRequirements.push({ requirement: requirement.description, met: checkMovement(units, requirement.speed, amount, requirement.jumpException) });
						break;
					case "Ability":
						primaryRequirements.push({ requirement: requirement.description, met: checkAbility(units, requirement.abilities, amount) });
						break;
					case "Commander":
						primaryRequirements.push({ requirement: requirement.description, met: 0 });
						break;
					case "Faction":
						primaryRequirements.push({ requirement: requirement.description, met: list.details.factions.includes(requirement.allowedFactions) ? 1 : -1 });
						break;
					case "Types":
						primaryRequirements.push({ requirement: requirement.description, met: checkTypes(units, requirement.allowedTypes) });
						break;
					case "SameModel":
						primaryRequirements.push({ requirement: requirement.description, met: checkSameModel(units) });
						break;
					case "AerospacePair":
						primaryRequirements.push({ requirement: requirement.description, met: checkAerospacePair(units) });
					case "Transport":
						primaryRequirements.push({ requirement: requirement.description, met: -1 });
						break;
				}
			}
			const valid = units.length >= (formationData?.minimumUnits ?? 3) && (idealMet || primaryRequirements.filter((req) => req.met == -1).length == 0);
			primaryResults = { valid, requirements: primaryRequirements };
		}
	} else {
		primaryResults = {
			valid: false,
			requirements: [{ requirement: "Formation type not found", met: -1 }]
		};
	}

	const secondaryRequirements: { requirement: string; met: number }[] = [];
	let secondaryResults: { valid: boolean; requirements: { requirement: string; met: number }[] };
	if (formation.secondary) {
		const secondaryData = getFormationDataFromName(formation.secondary.type);
		if (secondaryData) {
			const secondaryUnits: ListUnit[] = [];
			for (const unitId of formation.secondary?.units ?? []) {
				const unit = list.getUnit(unitId.id);
				if (unit) {
					secondaryUnits.push(unit);
				}
			}
			//check for ideal role
			let idealMet = false;
			if (secondaryData?.ideal) {
				idealMet = secondaryUnits.length != 0 && secondaryUnits.filter((unit) => unit.baseUnit.role == secondaryData.ideal).length == secondaryUnits.length;
				secondaryRequirements.push({
					requirement: `Ideal Role: ${secondaryData.ideal}`,
					met: idealMet ? 1 : 0
				});
			}
			//check if minimum unit count is defined by formation, or default to 3 units if not.
			secondaryRequirements.push({
				requirement: `Formation must have at least ${secondaryData?.minimumUnits ?? 3} units`,
				met: secondaryUnits.length >= (secondaryData?.minimumUnits ?? 3) ? 1 : -1
			});
			if (secondaryData.maximumUnits) {
				secondaryRequirements.push({
					requirement: `Formation must have at most ${secondaryData.maximumUnits} units`,
					met: secondaryUnits.length <= secondaryData?.maximumUnits ? 1 : -1
				});
			}
			if (!secondaryData.requirements || secondaryData.requirements.length == 0) {
				secondaryRequirements.push({ requirement: "No additional Requirements", met: 0 });
				secondaryResults = { valid: secondaryUnits.length >= (secondaryData?.minimumUnits ?? 3), requirements: secondaryRequirements };
			} else {
				//loop through and process requirements
				for (const requirement of secondaryData.requirements ?? []) {
					let amount = "amount" in requirement ? (requirement.flatAmount ? requirement.amount : secondaryUnits.length * requirement.amount) : 0;
					switch (requirement.type) {
						case "Size":
							secondaryRequirements.push({ requirement: requirement.description, met: checkSize(secondaryUnits, requirement.size, requirement.limit, amount) });
							break;
						case "Role":
							const alternateAmount = requirement.alternateFlatAmount ? requirement.alternateAmount : secondaryUnits.length * (requirement.alternateAmount ?? 0);
							secondaryRequirements.push({
								requirement: requirement.description,
								met: checkRoles(secondaryUnits, requirement.roles, amount, requirement.alternateRoles, alternateAmount)
							});
							break;
						case "Armor":
							secondaryRequirements.push({ requirement: requirement.description, met: checkArmor(secondaryUnits, requirement.armor, amount) });
							break;
						case "Damage":
							secondaryRequirements.push({
								requirement: requirement.description,
								met: checkDamage(secondaryUnits, requirement.damage, requirement.range, requirement.limit, amount)
							});
							break;
						case "Movement":
							secondaryRequirements.push({ requirement: requirement.description, met: checkMovement(secondaryUnits, requirement.speed, amount, requirement.jumpException) });
							break;
						case "Ability":
							secondaryRequirements.push({ requirement: requirement.description, met: checkAbility(secondaryUnits, requirement.abilities, amount) });
							break;
						case "Commander":
							secondaryRequirements.push({ requirement: requirement.description, met: 0 });
							break;
						case "Faction":
							secondaryRequirements.push({ requirement: requirement.description, met: list.details.factions.includes(requirement.allowedFactions) ? 1 : -1 });
							break;
						case "Types":
							secondaryRequirements.push({ requirement: requirement.description, met: checkTypes(secondaryUnits, requirement.allowedTypes) });
							break;
						case "SameModel":
							secondaryRequirements.push({ requirement: requirement.description, met: checkSameModel(secondaryUnits) });
							break;
						case "Transport":
							secondaryRequirements.push({ requirement: requirement.description, met: checkTransport(units, secondaryUnits) });
							break;
						case "AerospacePair":
							secondaryRequirements.push({ requirement: requirement.description, met: checkAerospacePair(secondaryUnits) });
					}
				}
				const valid = secondaryUnits.length >= (secondaryData?.minimumUnits ?? 3) && (idealMet || secondaryRequirements.filter((req) => req.met == -1).length == 0);
				secondaryResults = { valid, requirements: secondaryRequirements };
			}
		} else {
			secondaryResults = {
				valid: false,
				requirements: [{ requirement: "Formation type not found", met: -1 }]
			};
		}
	} else {
		secondaryResults = { valid: true, requirements: [{ requirement: "Optionally choose a secondary formation", met: 0 }] };
	}

	return { primary: primaryResults, secondary: secondaryResults };
}

function checkSize(units: ListUnit[], size: number, limit: "equal" | "equalOrGreater" | "equalOrLess", amount: number) {
	let unitsOfSize = 0;
	switch (limit) {
		case "equal":
			unitsOfSize = units.filter((unit) => (unit.baseUnit.size ?? 0) == size).length;
			break;
		case "equalOrGreater":
			unitsOfSize = units.filter((unit) => (unit.baseUnit.size ?? 0) >= size).length;
			break;
		case "equalOrLess":
			unitsOfSize = units.filter((unit) => (unit.baseUnit.size ?? 0) <= size).length;
			break;
	}
	return units.length != 0 && unitsOfSize >= amount ? 1 : -1;
}
function checkRoles(units: ListUnit[], roles: string[], amount: number, alternateRoles?: string[], alternateAmount?: number) {
	return (units.length != 0 && units.filter((unit) => roles.includes(unit.baseUnit.role ?? "")).length >= amount) ||
		(alternateAmount && units.filter((unit) => (alternateRoles ?? []).includes(unit.baseUnit.role ?? "")).length >= alternateAmount)
		? 1
		: -1;
}
function checkArmor(units: ListUnit[], armor: number, amount: number) {
	return units.length != 0 && units.filter((unit) => (unit.baseUnit.armor ?? 0) > armor).length >= amount ? 1 : -1;
}
function checkDamage(units: ListUnit[], damage: number, range: string, limit: "equal" | "equalOrGreater" | "equalOrLess", amount: number) {
	if (limit == "equalOrGreater") {
		return units.length != 0 &&
			units.filter((unit) => {
				switch (range) {
					case "short":
						return (unit.baseUnit.damageS ?? 0) >= damage;
					case "medium":
						return (unit.baseUnit.damageM ?? 0) >= damage;
					case "long":
						return (unit.baseUnit.damageL ?? 0) >= damage;
					case "all":
						return (unit.baseUnit.damageS ?? 0) >= damage && (unit.baseUnit.damageM ?? 0) >= damage && (unit.baseUnit.damageL ?? 0) >= damage;
				}
			}).length >= amount
			? 1
			: -1;
	} else {
		return units.length != 0 &&
			units.filter((unit) => {
				switch (range) {
					case "short":
						return (unit.baseUnit.damageS ?? 0) <= damage;
					case "medium":
						return (unit.baseUnit.damageM ?? 0) <= damage;
					case "long":
						return (unit.baseUnit.damageL ?? 0) <= damage;
					case "all":
						return (unit.baseUnit.damageS ?? 0) <= damage && (unit.baseUnit.damageM ?? 0) <= damage && (unit.baseUnit.damageL ?? 0) <= damage;
				}
			}).length >= amount
			? 1
			: -1;
	}
}
function checkMovement(units: ListUnit[], speed: number, amount: number, jumpException?: number) {
	return units.length != 0 &&
		units.filter((unit) => {
			for (const movement of unit.baseUnit.move ?? []) {
				if (movement.type != "j") {
					if (movement.speed >= speed) {
						return true;
					}
				} else {
					if (jumpException !== undefined && movement.speed >= jumpException) {
						return true;
					}
				}
			}
		}).length >= amount
		? 1
		: -1;
}
function checkAbility(units: ListUnit[], abilities: string[], amount: number) {
	return units.length != 0 &&
		units.filter((unit) => {
			for (const ability of unit.baseUnit.abilities) {
				if (abilities.includes(ability.name)) {
					return true;
				}
			}
		}).length >= amount
		? 1
		: -1;
}
function checkTypes(units: ListUnit[], types: string[]) {
	return units.length && units.filter((unit) => !types.includes(unit.baseUnit.subtype)).length == 0 ? 1 : -1;
}
function checkSameModel(units: ListUnit[]) {
	return units.length &&
		units.filter((unit) => (unit.baseUnit.group == "" || unit.baseUnit.group != units[0].baseUnit.group) && unit.baseUnit.class != units[0].baseUnit.class).length == 0
		? 1
		: -1;
}
function checkAerospacePair(units: ListUnit[]) {
	if (units.length != 2) {
		return -1;
	}
	return units[0].baseUnit.name == units[1].baseUnit.name ? 1 : -1;
}
function checkTransport(units: ListUnit[], secondaryUnits: ListUnit[]) {
	//sort units based on it capacity
	let transports = units
		.filter((unit) => unit.baseUnit.abilities.find((ability) => ability.name == "IT"))
		.toSorted((a, b) => (b.baseUnit.abilities.find((ability) => ability.name == "IT")?.v ?? 0) - (a.baseUnit.abilities.find((ability) => ability.name == "IT")?.v ?? 0))
		.map((unit) => {
			return { id: unit.id, capacity: unit.baseUnit.abilities.find((ability) => ability.name == "IT")?.v ?? 0, transported: 0 };
		});
	//sort units based on car requirements
	let infantry = secondaryUnits.toSorted(
		(a, b) => (b.baseUnit.abilities.find((ability) => ability.name == "CAR")?.v ?? 0) - (a.baseUnit.abilities.find((ability) => ability.name == "CAR")?.v ?? 0)
	);
	const omniCount = units.filter((unit) => unit.baseUnit.abilities.find((ability) => ability.name == "OMNI")).length;
	const nonOmniCount = units.filter((unit) => unit.baseUnit.abilities.find((ability) => ability.name == "OMNI") == undefined).length;

	let mountedMEC = 0;
	for (const mecUnit of infantry.filter((unit) => unit.baseUnit.abilities.find((ability) => ability.name == "MEC"))) {
		if (mountedMEC < omniCount) {
			mountedMEC++;
			const unitIndex = infantry.findIndex((unit) => unit.id == mecUnit.id);
			infantry.splice(unitIndex, 1);
		}
	}
	let mountedXMEC = 0;
	for (const xmecUnit of infantry.filter((unit) => unit.baseUnit.abilities.find((ability) => ability.name == "XMEC"))) {
		if (mountedXMEC < omniCount - mountedMEC + nonOmniCount) {
			mountedXMEC++;
			const unitIndex = infantry.findIndex((unit) => unit.id == xmecUnit.id);
			infantry.splice(unitIndex, 1);
		}
	}

	const remainingInf = structuredClone($state.snapshot(infantry));
	for (const inf of infantry) {
		let carReq = inf.baseUnit.abilities.find((ability) => ability.name == "CAR")?.v ?? 0;
		for (const transport of transports) {
			if (transport.capacity - transport.transported >= carReq) {
				transport.transported += carReq;
				const unitIndex = remainingInf.findIndex((unit) => unit.id == inf.id);
				remainingInf.splice(unitIndex, 1);

				break;
			}
		}
	}

	return remainingInf.length > 0 ? -1 : 1;
}
