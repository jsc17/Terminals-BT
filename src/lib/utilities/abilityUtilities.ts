import { abilityReferences, numberedAbilityReference, type UnitAbility } from "$lib/data/abilities";

function parseValues(values: string[]) {
	const parsedValues = values.map((value): [number, boolean] => [Number(value.replace("*", "").replace("-", "0")), value.includes("*")]);
	const [v, vmin]: [number | undefined, boolean | undefined] = parsedValues.length === 1 ? parsedValues[0] : [undefined, undefined];
	const [s, smin]: [number | undefined, boolean | undefined] = parsedValues.length > 1 ? parsedValues[0] : [undefined, undefined];
	const [m, mmin]: [number | undefined, boolean | undefined] = parsedValues.length > 1 ? parsedValues[1] : [undefined, undefined];
	const [l, lmin]: [number | undefined, boolean | undefined] = parsedValues.length > 2 ? parsedValues[2] : [undefined, undefined];
	const [e, emin]: [number | undefined, boolean | undefined] = parsedValues.length > 3 ? parsedValues[3] : [undefined, undefined];

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
		//looks for the first number not followed by c3 letter in the string and gets it's index
		ability = ability.replace("LRM-", "LRM0");
		const index = ability.search(/\d(?:[^emsbi]|$)/i);
		let abilityName = "";
		if (index != -1) {
			abilityName = ability.slice(0, index).trim();
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
	const parsedAbilities: UnitAbility[] = [];

	//parse turret abilities first because they are nested within the main ability string
	const turretMatch = abilityString.match(/TUR\(([^)]+)\)/i);
	let turret: UnitAbility = { name: "TUR", turretAbilities: [] };

	if (turretMatch !== null) {
		const turretAbilities = turretMatch[1].split(",").map((ability) => ability.trim());
		if (turretAbilities[0][0] == "-" || !isNaN(Number(turretAbilities[0][0]))) {
			const turretDamageValues = turretAbilities.shift()!.split("/");
			const { s, smin, m, mmin, l, lmin, e, emin } = parseValues(turretDamageValues);
			turret = { ...turret, s, smin, m, mmin, l, lmin, e, emin };
		}
		for (let turretAbility of turretAbilities) {
			const artMatch = turretAbility.match(/(ART)(.*?)-(\d+)/i);
			if (artMatch !== null) {
				const artAbility = { name: "ART", artType: artMatch[2], v: Number(artMatch[3]) };
				turret.turretAbilities!.push(artAbility);
			} else {
				turret.turretAbilities!.push(parseAbility(turretAbility));
			}
		}
		abilityString = abilityString.replace(/TUR\(([^)]+)\)/i, "TUR");
	}

	const unitAbilities = abilityString.split(",").map((ability) => ability.trim());

	for (let ability of unitAbilities) {
		if (ability == "") continue;
		//check if the ability is a turret ability and if so, add previously parsed data
		if (ability == "TUR") {
			parsedAbilities.push(turret);
			continue;
		}

		//check if ability is artillery
		const artMatch = ability.match(/(ART)(.*?)-(\d+)/i);
		if (artMatch !== null) {
			parsedAbilities.push({ name: "ART", artType: artMatch[2], v: Number(artMatch[3]) });
			continue;
		}

		//check if ability is a BIM or LAM and if so, extract the data within the parentheses
		const bimlamMatch = ability.match(/(BIM|LAM)(\([^)]+\))/i);
		if (bimlamMatch !== null) {
			parsedAbilities.push({ name: bimlamMatch[1], extracted: bimlamMatch[2] });
			continue;
		}

		parsedAbilities.push(parseAbility(ability));
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
