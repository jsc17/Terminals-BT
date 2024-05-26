import { getNewSkillCost } from "$lib/utilities/bt-utils";
import type { Unit } from "$lib/types/unit.js";
import { type Options, ruleSets } from "./options";

function createList() {
	let units = $state<Unit[]>([]);
	let details = $state({ name: "", era: "", faction: "", general: "" });
	let options = $state<Options>();
	let sublist = false;
	let validate = false;

	let pv = $derived.by(() => {
		let listPV = 0;
		units.forEach((unit) => {
			listPV += unit.cost;
		});
		return listPV;
	});

	function setOptions(newRules: string) {
		options = ruleSets.find((rules) => rules.name == newRules) ?? ruleSets[0];
	}

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
		get options() {
			return options;
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
		},
		setOptions
	};
}

export const list = createList();
