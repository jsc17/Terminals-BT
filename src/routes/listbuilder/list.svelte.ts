import { getNewSkillCost } from "$lib/utilities/bt-utils";
import type { Unit } from "$lib/types/unit.js";
import { type Options, ruleSets } from "./options";
import { DraggableList } from "$lib/utilities/DraggableList.svelte";

class UnitList {
	units = $state<Unit[]>([]);
	// units = new DraggableList<Unit>();
	details = $state({ name: "", era: "", faction: "", general: "" });
	options = $state<Options>();
	sublists = $state<string[]>([]);
	validate = false;
	id = 0;

	pv = $derived.by(() => {
		let listPV = 0;

		for (const unit of this.units) {
			listPV += unit.cost;
		}
		return listPV;
	});

	setOptions(newRules: string) {
		this.options = ruleSets.find((rules) => rules.name == newRules) ?? ruleSets[0];
	}

	add(unit: Unit) {
		this.units.push(JSON.parse(JSON.stringify(unit)));
		this.units.at(-1)!.id = this.id;
		this.id++;
	}
	remove(index: number) {
		const removed = this.units.splice(index, 1)[0];
	}
	modifySkill(index: number, newSkill: number, basePV: number) {
		let newCost = getNewSkillCost(newSkill, basePV);

		this.units[index].skill = newSkill;
		this.units[index].cost = newCost;
	}
	moveUnit(index: number, newIndex: number) {
		if (newIndex >= 0 && newIndex < this.units.length) {
			let temp = this.units[newIndex];
			this.units[newIndex] = this.units[index];
			this.units[index] = temp;
		}
	}
}

export const list = new UnitList();
