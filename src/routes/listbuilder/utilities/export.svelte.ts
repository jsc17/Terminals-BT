import { toastController } from "$lib/stores/toastController.svelte";
import type { UnitV2 } from "$lib/types/unit";

export function exportToJeff(name: string, units: UnitV2[]) {
	const jeffList: any = { name: name, members: [], uuid: crypto.randomUUID(), lastUpdated: new Date().toISOString(), formationBonus: "none", groupLabel: "Lance" };
	units.forEach((unit) => {
		if (unit.baseUnit.mulId > 0) {
			let jumpSpeed = 0;
			if (unit.baseUnit.move) {
				for (const move of unit.baseUnit.move) {
					if (move.type == "j") {
						jumpSpeed = move.speed;
					}
				}
			}
			const member: any = {
				mechCreatorUUID: "",
				mulID: unit.baseUnit.mulId,
				damage: {
					short: unit.baseUnit.damageS,
					shortMinimal: unit.baseUnit.damageSMin,
					medium: unit.baseUnit.damageM,
					mediumMinimal: unit.baseUnit.damageMMin,
					long: unit.baseUnit.damageL,
					longMinimal: unit.baseUnit.damageLMin,
					extreme: unit.baseUnit.damageE,
					extremeMinimal: unit.baseUnit.damageEMin
				},
				variant: unit.baseUnit.variant,
				dateIntroduced: unit.baseUnit.date,
				name: unit.baseUnit.name,
				tonnage: unit.baseUnit.tonnage,
				role: unit.baseUnit.role,
				imageURL: unit.baseUnit.imageLink,
				structure: unit.baseUnit.structure,
				armor: unit.baseUnit.armor,
				type: unit.baseUnit.subtype,
				size: unit.baseUnit.size,
				abilities: unit.baseUnit.abilities.split(",").map((ability: string) => {
					return ability.trim();
				}),
				overheat: unit.baseUnit.overheat,
				basePoints: unit.baseUnit.pv,
				currentSkill: unit.skill,
				showDetails: false,
				tmm: 0,
				uuid: unit.id,
				threshhold: 0,
				move: unit.baseUnit.move?.map((movement) => { return { move: movement.speed, currentMove: movement.speed, type: movement.type } }),
				jumpMove: jumpSpeed,
			};
			jeffList.members.push(member);
		}
	});
	const blob = new Blob([JSON.stringify(jeffList)], { type: "application/json" });
	const downloadElement = document.createElement("a");
	downloadElement.download = `${name}.json`;
	downloadElement.href = URL.createObjectURL(blob);
	downloadElement.click();
	downloadElement.remove();
	toastController.addToast("Generating JSON for import into Jeff's Battletech Tools");
}
