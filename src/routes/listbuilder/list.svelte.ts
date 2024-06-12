import { getNewSkillCost } from "$lib/utilities/bt-utils";
import { isUnit, type Unit, type Formation } from "$lib/types/unit.js";
import { type Options, ruleSets } from "./options";

class UnitList {
	units = $state<(Unit | Formation)[]>([]);
	details = $state({ name: "", era: "", faction: "", general: "" });
	options = $state<Options>();
	sublists = $state<string[]>([]);
	validate = false;
	id = 0;

	unitCount = $derived.by(() => {
		let tempCount = 0;
		for (const item of this.units) {
			if (isUnit(item)) {
				tempCount++;
			}
		}
		return tempCount;
	});

	pv = $derived.by(() => {
		let listPV = 0;

		for (const unit of this.units) {
			if (isUnit(unit)) {
				listPV += unit.cost;
			}
		}
		return listPV;
	});

	setOptions(newRules: string) {
		this.options = ruleSets.find((rules) => rules.name == newRules) ?? ruleSets[0];
	}

	addUnit(unit: Unit) {
		this.units.push(JSON.parse(JSON.stringify(unit)));
		this.units.at(-1)!.id = this.id;
		this.id++;
	}
	addFormation() {
		this.units.push({ id: this.id, name: `New Formation`, type: "Battle", units: [] } as Formation);
		this.id++;
	}
	remove(index: number) {
		const removed = this.units.splice(index, 1)[0];
	}
	modifySkill(index: number, newSkill: number, basePV: number) {
		let newCost = getNewSkillCost(newSkill, basePV);

		const item = this.units[index];
		if (isUnit(item)) {
			item.skill = newSkill;
			item.cost = newCost;
		}
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
