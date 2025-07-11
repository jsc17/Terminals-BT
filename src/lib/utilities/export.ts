import type { MulUnit } from "$lib/types/listTypes";
import { nanoid } from "nanoid";
import { createAbilityLineString, createSingleAbilityString } from "./abilityUtilities";

function exportResultsToCSV(units: MulUnit[]) {
	const rows = [];

	rows.push(
		"Id, name, class, variant, type, subtype, pv, size, move, armor, structure, damageS, damageSMin, damageM, damageMMin, damageL, damageLMin, damageE, damageEMin, overheat, abilities, imagelink, rulesLevel, tonnage, intro, role, technology, threshold"
	);
	for (const unit of units) {
		const unitValues = [
			unit.mulId,
			`"=hyperlink(""${`http://masterunitlist.info/Unit/Details/${unit.mulId}`}"", ""${unit.name.replaceAll(`"`, ``)}"")"`,
			`"=hyperlink(""${`https://www.sarna.net/wiki/${unit.class.replaceAll(" ", "_").replaceAll(`"`, ``)}`}"", ""${unit.class.replaceAll(`"`, ``)}"")"`,
			unit.variant,
			unit.type,
			unit.subtype,
			unit.pv,
			unit.size,
			unit.move?.map((move) => `${move.speed}${move.type ?? ""}`).join("/"),
			unit.armor,
			unit.structure,
			unit.damageS,
			unit.damageSMin,
			unit.damageM,
			unit.damageMMin,
			unit.damageL,
			unit.damageLMin,
			unit.damageE,
			unit.damageEMin,
			unit.overheat,
			`"${createAbilityLineString(unit.abilities).replaceAll(`"`, "")}"`,
			unit.imageLink?.replaceAll("\r", "").replaceAll("\n", ""),
			unit.rulesLevel,
			unit.tonnage,
			unit.date,
			unit.role,
			unit.technology,
			unit.threshold
		];
		rows.push(unitValues.join(","));
	}

	const csv = rows.join("\n");
	const blob = new Blob([csv], { type: "text/csv" });
	const url = URL.createObjectURL(blob);

	const downloadElement = document.createElement("a");
	downloadElement.download = `export-${nanoid(10)}`;
	downloadElement.href = URL.createObjectURL(blob);
	downloadElement.click();
}

export { exportResultsToCSV as exportArrayToCSV };
