import { abilityReferences, numberedAbilityReference, type UnitAbility } from "$lib/data/abilities";

function parseValues(values: string[]) {
	let v, vmin, s, smin, m, mmin, l, lmin, e, emin;
	switch (values.length) {
		case 4:
			if (values[3].includes("*")) {
				emin = true;
			}
			e = Number(values[3].replace("*", "").replace("-", "0"));

		case 3:
			if (values[2].includes("*")) {
				lmin = true;
			}
			l = Number(values[2].replace("*", "").replace("-", "0"));
		case 2:
			if (values[1].includes("*")) {
				mmin = true;
				values[1].replace("*", "");
			}
			m = Number(values[1].replace("*", "").replace("-", "0"));

			if (values[0].includes("*")) {
				smin = true;
				values[0].replace("*", "");
			}
			s = Number(values[0].replace("*", "").replace("-", "0"));

			break;
		case 1:
			if (values[0].includes("*")) {
				vmin = true;
			}
			v = Number(values[0].replace("*", ""));
	}
	return { v, vmin, s, smin, m, mmin, l, lmin, e, emin };
}

function parseAbility(ability: string): UnitAbility {
	if (
		!numberedAbilityReference.includes(ability) &&
		abilityReferences.find(({ abbr }) => {
			return ability == abbr;
		})
	) {
		return { name: ability };
	} else {
		const index = ability.search(/\d(?:[^emsbi]|$)/i);
		let abilityName = "";
		if (index != -1) {
			abilityName = ability.slice(0, index);
			const values = ability.slice(index, ability.length).split("/");
			const { v, vmin, s, smin, m, mmin, l, lmin, e, emin } = parseValues(values);
			let parse: UnitAbility = { name: abilityName, v, vmin, s, smin, m, mmin, l, lmin, e, emin };

			Object.keys(parse).forEach((key) => parse[key] === undefined && delete parse[key]);
			return parse;
		} else {
			abilityName = ability;
			return { name: abilityName, vhid: 1 };
		}
	}
}

export function handleParse(abilityString: string) {
	const parsedAbilities = [];
	let turret: UnitAbility, bimLam: UnitAbility, artAbility: UnitAbility;
	const turretMatch = abilityString.match(/TUR\(([^)]+)\)/i);
	const bimlamMatch = abilityString.match(/(BIM|LAM)(\([^)]+\))/i);
	const artMatch = abilityString.match(/(ART)(.*?-)(\d+)/i);
	if (bimlamMatch !== null) {
		bimLam = { name: bimlamMatch[1], extracted: bimlamMatch[2] };
		abilityString = abilityString.replace(/(BIM|LAM)(\([^)]+\))/i, bimlamMatch[1]);
	}
	if (turretMatch !== null) {
		const turretAbilities = turretMatch[1].split(",").map((ability) => ability.trim());
		const turretDamageValues = turretAbilities[0].split("/");
		if (turretDamageValues.length != 1) {
			const { s, smin, m, mmin, l, lmin, e, emin } = parseValues(turretDamageValues);
			const parsedTurretAbilities: UnitAbility[] = [];
			for (const ability of turretAbilities.slice(1)) {
				parsedTurretAbilities.push(parseAbility(ability));
			}
			const parsedTurret = { name: "TUR", s, smin, m, mmin, l, lmin, e, emin, turretAbilities: parsedTurretAbilities };
			turret = parsedTurret;
		} else {
			const parsedTurretAbilities: UnitAbility[] = [];
			for (const ability of turretAbilities) {
				parsedTurretAbilities.push(parseAbility(ability));
			}
			const parsedTurret = { name: "TUR", turretAbilities: parsedTurretAbilities };
			turret = parsedTurret;
		}
		abilityString = abilityString.replace(/TUR\(([^)]+)\)/, "TUR");
	}
	if (artMatch !== null) {
		artAbility = { name: "ART", artType: artMatch[2], v: Number(artMatch[3]) };
		abilityString = abilityString.replace(/(ART)(.*?-)(\d+)/i, "ART");
	}
	const unitAbilities = abilityString.split(",").map((ability) => ability.trim());
	for (const ability of unitAbilities) {
		switch (ability) {
			case "TUR":
				parsedAbilities.push(turret!);
				break;
			case "BIM":
			case "LAM":
				parsedAbilities.push(bimLam!);
				break;
			case "ART":
				parsedAbilities.push(artAbility!);
				break;
			case "":
				break;
			default:
				parsedAbilities.push(parseAbility(ability));
		}
	}
	return parsedAbilities;
}

export function createAbilityLineString(abilities: UnitAbility[]): string {
	let abilityStrings: string[] = [];
	for (const ability of abilities) {
		abilityStrings.push(createSingleAbilityString(ability));
	}
	return abilityStrings.length ? abilityStrings.join(", ") : "-";
}

export function createSingleAbilityString(ability: UnitAbility): string {
	let string = "";
	let turretString = "";

	for (const turretAbility of ability.turretAbilities ?? []) {
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
	return string;
}
