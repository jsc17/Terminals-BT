import type { MulUnit } from "$lib/types/listTypes";
import { handleParse } from "$lib/utilities/abilityUtilities";

export function convertUnitDataToMulUnit(unitData: any): MulUnit {
	let tempMovement: { speed: number; type: string }[] = [];
	unitData.move.split("/").forEach((movement: string) => {
		let moveSpeed = movement.replaceAll('"', "").match(/\d+/) ?? "0";
		let moveType = movement.replaceAll('"', "").match(/\D+/) ?? "";
		tempMovement.push({ speed: parseInt(moveSpeed[0]), type: moveType[0] });
	});
	if (tempMovement[0].type == "j" && tempMovement.length == 1) {
		tempMovement[0].type = "";
		tempMovement.push({ type: "j", speed: tempMovement[0].speed });
	}
	return {
		id: unitData.id,
		mulId: unitData.mulId,
		name: unitData.name,
		group: unitData.group,
		class: unitData.class,
		variant: unitData.variant,
		type: unitData.type,
		subtype: unitData.subtype?.toUpperCase() ?? "",
		pv: unitData.pv,
		size: unitData.size,
		move: tempMovement,
		tmm: unitData.tmm,
		health: unitData.armor + unitData.structure,
		armor: unitData.armor,
		structure: unitData.structure,
		damageS: unitData.damage_s,
		damageSMin: unitData.damage_s_min,
		damageM: unitData.damage_m,
		damageMMin: unitData.damage_m_min,
		damageL: unitData.damage_l,
		damageLMin: unitData.damage_l_min,
		damageE: unitData.damage_e,
		damageEMin: unitData.damage_e_min,
		overheat: unitData.overheat,
		abilities: unitData.abilities ? handleParse(unitData.abilities) : [],
		imageLink: unitData.image_url ?? undefined,
		rulesLevel: unitData.rules ?? "",
		technology: unitData.technology ?? "",
		tonnage: unitData.tonnage ?? 0,
		date: unitData.date_introduced ?? 0,
		role: unitData.role ?? "",
		availability: undefined,
		threshold: unitData.threshold
	};
}
