import { deserialize } from "$app/forms";
import type { MulUnit } from "$lib/types/unit";

export async function loadreference(mulId: string) {
	let response: any = deserialize(await (await fetch("/?/getUnit", { method: "POST", body: JSON.stringify({ mulId }) })).text());
	let tempMovement: { speed: number; type: string }[] = [];
	response.data!.unit.move.split("/").forEach((movement: string) => {
		let moveSpeed = movement.replaceAll('"', "").match(/\d+/) ?? "0";
		let moveType = movement.replaceAll('"', "").match(/\D+/) ?? "";
		tempMovement.push({ speed: parseInt(moveSpeed[0]), type: moveType[0] });
	});
	if (tempMovement[0].type == "j" && tempMovement.length == 1) {
		tempMovement[0].type = "";
		tempMovement.push({ type: "j", speed: tempMovement[0].speed });
	}
	const unitData = response.data!.unit;
	const reference: MulUnit = {
		mulId: unitData.mulId,
		name: unitData.name,
		class: unitData.class,
		variant: unitData.variant,
		type: unitData.type,
		subtype: unitData.subtype.toUpperCase(),
		pv: unitData.pv,
		cost: unitData.pv,
		skill: 4,
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
		abilities: (unitData.abilities ?? "-").replaceAll(",", ", "),
		imageLink: unitData.image_url,
		rulesLevel: unitData.rules,
		tonnage: unitData.tonnage,
		date: unitData.date_introduced,
		role: unitData.role,
		availability: unitData.availability,
		threshold: unitData.threshold
	};
	return reference;
}
