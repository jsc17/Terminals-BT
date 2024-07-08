import { isUnit, type Unit } from "$lib/types/unit";
import { type Formation } from "$lib/types/formation.svelte";
import { type Options, ruleSets } from "../../lib/types/options";
import { getNewSkillCost } from "$lib/utilities/bt-utils";
import customCards from "$lib/data/customCards.json";
import type { ResultList } from "$lib/types/resultList.svelte";

export class UnitList {
	items = $state<(Unit | Formation)[]>([]);
	details = $state({ name: "", era: -1, faction: -1, general: -1 });
	options = $state<Options>(ruleSets[0]);
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
	clear() {
		this.items = [];
		this.details = { name: "", era: 0, faction: 0, general: -1 };
		this.options = ruleSets[0];
		this.sublists = [];
		this.validate = false;
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
				if (item.mulId > 0) {
					tempUnitArray.push(`{${item.mulId},${item.skill}}`);
				}
			} else {
				for (const unit of item.units) {
					if (unit.mulId > 0) {
						tempUnitArray.push(`{${unit.mulId},${unit.skill}}`);
					}
				}
			}
		}
		return `{${tempUnitArray.join(",")}}`;
	}
	async loadList(data: any, resultList: ResultList) {
		const { era, faction, name, units, sublists, rules } = data;
		this.setOptions(rules.name);
		resultList.setOptions(rules.name);

		resultList.details.era = era;
		resultList.details.faction = faction;

		await resultList.loadUnits();

		this.details.name = name;
		this.details.era = era;
		this.details.faction = faction;
		this.details.general = resultList.general;
		this.sublists = sublists;

		this.items = [];
		let unitArray = units;
		for (const item of unitArray) {
			if (item.charAt(0) == "{") {
				const formationData = JSON.parse(item);
				const tempFormation = { style: formationData.style, name: formationData.name, type: formationData.type, units: <Unit[]>[] };

				for (const unit of formationData.units) {
					let [id, skill] = unit.split(",");
					let unitToAdd = JSON.parse(
						JSON.stringify(
							resultList.resultList.find((result: Unit) => {
								return result.mulId == parseInt(id);
							})
						)
					);
					if (unitToAdd != null) {
						if (skill != "undefined") {
							unitToAdd.skill = parseInt(skill);
							unitToAdd.cost = getNewSkillCost(parseInt(skill), unitToAdd.pv);
						}
						tempFormation.units.push(unitToAdd);
					}
				}
				this.addFormation(tempFormation.style, tempFormation.name, tempFormation.type, tempFormation.units);
			} else {
				let [id, skill] = item.split(",");
				if (Number(id) < 0) {
					for (const unitList of customCards.unitPacks) {
						for (const unit of unitList.units) {
							if (unit.id == Number(id)) {
								this.addUnit({
									mulId: unit.id,
									type: unit.type,
									subtype: unit.type,
									name: unit.name,
									class: unit.class,
									variant: unit.variant,
									pv: unit.pv,
									cost: unit.pv,
									abilities: unit.abilities,
									rulesLevel: "standard"
								});
							}
						}
					}
				} else {
					let unitToAdd = JSON.parse(
						JSON.stringify(
							resultList.resultList.find((result: Unit) => {
								return result.mulId == parseInt(id);
							})
						)
					);
					if (unitToAdd != null) {
						if (skill != "undefined") {
							unitToAdd.skill = parseInt(skill);
							unitToAdd.cost = getNewSkillCost(parseInt(skill), unitToAdd.pv);
						}
						this.addUnit(unitToAdd);
					}
				}
			}
		}
	}
}
