import type { UnitList } from "$lib/types/list.svelte";

export function exportToJeff(list: UnitList) {
	const jeffList: any = { name: list.details.name, members: [], uuid: crypto.randomUUID(), lastUpdated: new Date().toISOString(), formationBonus: "none", groupLabel: "Lance" };
	for (const unit of list.units) {
		let jumpSpeed = 0;
		if (unit.move) {
			for (const move of unit.move) {
				if (move.type == "j") {
					jumpSpeed = move.speed;
				}
			}
		}
		const member: any = {
			mulID: unit.mulId,
			damage: {
				short: unit.damageS,
				shortMinimal: unit.damageSMin,
				medium: unit.damageM,
				mediumMinimal: unit.damageMMin,
				long: unit.damageL,
				longMinimal: unit.damageLMin,
				extreme: 0
			},
			variant: unit.variant,
			dateIntroduced: unit.date,
			name: unit.name,
			tonnage: unit.tonnage,
			role: unit.role,
			imageURL: unit.imageLink,
			structure: unit.structure,
			armor: unit.armor,
			type: unit.type,
			size: unit.size,
			abilities: unit.abilities.split(",").map((ability: string) => {
				return ability.trim();
			}),
			overheat: unit.overheat,
			basePoints: unit.pv,
			currentSkill: unit.skill,
			showDetails: false,
			tmm: 0,
			uuid: crypto.randomUUID(),
			threshhold: 0,
			move: unit.move,
			jumpMove: jumpSpeed
		};
		jeffList.members.push(member);
	}
	const blob = new Blob([JSON.stringify(jeffList)], { type: "application/json" });
	const downloadElement = document.createElement("a");
	downloadElement.download = `${list.details.name}.json`;
	downloadElement.href = URL.createObjectURL(blob);
	downloadElement.click();
	downloadElement.remove();
}
