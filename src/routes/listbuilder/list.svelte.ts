import { getNewSkillCost } from "$lib/utilities/bt-utils";
import type { Unit } from "$lib/types/unit.js";

function createList() {
	let units = $state<Unit[]>([]);
	let details = $state({ name: "", era: "", faction: "", general: "" });
	let sublist = false;
	let validate = false;

	let pv = $derived.by(() => {
		let listPV = 0;
		units.forEach((unit) => {
			listPV += unit.cost;
		});
		return listPV;
	});

	return {
		get units() {
			return units;
		},
		get pv() {
			return pv;
		},
		get sublist() {
			return sublist;
		},
		get validate() {
			return validate;
		},
		details,
		add: (unit: Unit) => {
			units.push(JSON.parse(JSON.stringify(unit)));
		},
		remove: (index: number) => {
			const removed = units.splice(index, 1)[0];
		},
		modifySkill: (index: number, newSkill: number, basePV: number) => {
			let newCost = getNewSkillCost(newSkill, basePV);

			units[index].skill = newSkill;
			units[index].cost = newCost;
		},
		moveUnit: (index: number, newIndex: number) => {
			if (newIndex >= 0 && newIndex < units.length) {
				let temp = units[newIndex];
				units[newIndex] = units[index];
				units[index] = temp;
			}
		}
	};
}

export const list = createList();
