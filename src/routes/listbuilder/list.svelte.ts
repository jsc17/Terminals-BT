import { getNewSkillCost } from "$lib/utilities/bt-utils";
import type { Unit } from "$lib/types/unit.js";
import { type Options, ruleSets } from "./options";
import { DraggableList } from "$lib/utilities/DraggableList.svelte";

function createList() {
	let units = new DraggableList<Unit>();
	let details = $state({ name: "", era: "", faction: "", general: "" });
	let options = $state<Options>();
	let sublists = $state<string[]>([]);
	let validate = false;
	let id = 0;

	let pv = $derived.by(() => {
		let listPV = 0;

		for (const unit of units.items) {
			listPV += unit.cost;
		}
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
		get sublists() {
			return sublists;
		},
		set sublists(newSublists) {
			sublists = newSublists;
		},
		get validate() {
			return validate;
		},
		get options() {
			return options;
		},
		details,
		add: (unit: Unit) => {
			units.items.push(JSON.parse(JSON.stringify(unit)));
			units.items.at(-1)!.listId = id.toString();
			id++;
		},
		remove: (index: number) => {
			const removed = units.items.splice(index, 1)[0];
		},
		modifySkill: (index: number, newSkill: number, basePV: number) => {
			let newCost = getNewSkillCost(newSkill, basePV);

			units.items[index].skill = newSkill;
			units.items[index].cost = newCost;
		},
		moveUnit: (index: number, newIndex: number) => {
			if (newIndex >= 0 && newIndex < units.items.length) {
				let temp = units.items[newIndex];
				units.items[newIndex] = units.items[index];
				units.items[index] = temp;
			}
		},
		setOptions
	};
}

export const list = createList();
