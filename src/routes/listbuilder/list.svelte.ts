import { isUnit, type Unit } from "./unit";
import { type Formation } from "./formation.svelte";
import { type Options, ruleSets } from "../../lib/types/options";

class UnitList {
	items = $state<(Unit | Formation)[]>([]);
	details = $state({ name: "", era: -1, faction: -1, general: -1 });
	options = $state<Options>();
	sublists = $state<string[]>([]);
	validate = false;
	id = 0;

	units = $derived.by(() => {
		const tempUnits: Unit[] = [];
		for (const item of this.items) {
			if (isUnit(item)) {
				tempUnits.push(item);
			} else {
				for (const unit of item.units) {
					tempUnits.push(unit);
				}
			}
		}
		return tempUnits;
	});

	unitCount = $derived.by(() => {
		let tempCount = 0;
		for (const item of this.items) {
			if (isUnit(item)) {
				tempCount++;
			} else {
				for (const unit of item.units) {
					tempCount++;
				}
			}
		}
		return tempCount;
	});

	pv = $derived.by(() => {
		let listPV = 0;

		for (const item of this.items) {
			if (isUnit(item)) {
				listPV += item.cost;
			} else {
				for (const unit of item.units) {
					listPV += unit.cost;
				}
			}
		}
		return listPV;
	});

	setOptions(newRules: string) {
		this.options = ruleSets.find((rules) => rules.name == newRules) ?? ruleSets[0];
	}

	addUnit(unit: Unit) {
		const tempUnit = JSON.parse(JSON.stringify(unit));
		tempUnit.id = this.id;
		this.id++;
		this.items.push(tempUnit);
	}
	addFormation(style: "ground" | "air" = "ground", name = "", type = "", units: Unit[] = []) {
		for (const unit of units) {
			unit.id = this.id;
			this.id++;
		}
		if (name == "") {
			name = `New ${style} formation`;
		}
		if (type == "") {
			if (style == "ground") {
				type = "Battle";
			} else {
				type = "Interceptor";
			}
		}
		this.items.push({ id: this.id, name, type, units, style } as Formation);
		this.id++;
	}
	remove(id: number) {
		this.items.forEach((item, index) => {
			if (item.id == id) {
				this.items.splice(index, 1);
			} else {
				if (!isUnit(item)) {
					item.units.forEach((unit, uIndex) => {
						if (unit.id == id) {
							item.units.splice(uIndex, 1);
						}
					});
				}
			}
		});
	}
	createListCode() {
		const listCode = {
			name: this.details.name,
			era: this.details.era,
			faction: this.details.faction,
			rules: this.options?.name,
			units: <string[]>[],
			sublists: this.sublists
		};
		for (const item of this.items) {
			if (isUnit(item)) {
				listCode.units.push(`${item.mulId},${item.skill}`);
			} else {
				const tempFormation = { name: item.name, type: item.type, units: <string[]>[] };
				for (const unit of item.units) {
					tempFormation.units.push(`${unit.mulId},${unit.skill}`);
				}
				listCode.units.push(JSON.stringify(tempFormation));
			}
		}
		return JSON.stringify(listCode);
	}
	createTTSCode() {
		let tempUnitArray = [];
		for (const item of this.items) {
			if (isUnit(item)) {
				tempUnitArray.push(`{${item.mulId},${item.skill}}`);
			} else {
				for (const unit of item.units) {
					tempUnitArray.push(`{${unit.mulId},${unit.skill}}`);
				}
			}
		}
		return `{${tempUnitArray.join(",")}}`;
	}
}

export const list = new UnitList();
