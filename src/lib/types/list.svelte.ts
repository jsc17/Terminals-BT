import { isUnit, type Unit } from "$lib/types/unit";
import { type Formation } from "$lib/types/formation.svelte";
import { type Options, ruleSets } from "../../lib/types/options";
import { getNewSkillCost } from "$lib/utilities/bt-utils";
import customCards from "$lib/data/customCards.json";
import type { ResultList } from "$lib/types/resultList.svelte";
import { Set } from "svelte/reactivity";

export class UnitList {
	items = $state<(Unit | Formation)[]>([]);
	details = $state({ name: "", era: -1, faction: -1, general: -1 });
	options = $state<Options>(ruleSets[0]);
	sublists = $state<string[]>([]);
	id = 0;
	resultList: ResultList;

	constructor(resultList: ResultList) {
		this.resultList = resultList;
	}

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

	issues = $derived.by(() => {
		const issueList = new Map<string, Set<string>>();
		const issueUnits = new Set<number>();
		if (this.options.maxPv && this.pv > this.options.maxPv) {
			issueList.set("Max PV", new Set([`${this.pv}/${this.options.maxPv}`]));
		}
		if (this.options.maxUnits && this.unitCount > this.options.maxUnits) {
			issueList.set("Max Units", new Set([`${this.unitCount}/${this.options.maxUnits}`]));
		}
		for (const unit of this.units) {
			if (this.options.eraFactionRestriction && (this.details.era == 0 || this.details.faction == 0)) {
				issueList.set("Era/Faction", new Set(["Must select era and faction"]));
				console.log("era/faction invalid");
			}
			if (this.options.allowedTypes && !this.options.allowedTypes.includes(unit.subtype)) {
				if (issueList.has("Invalid Type")) {
					issueList.get("Invalid Type")?.add(unit.name);
				} else {
					issueList.set("Invalid Type", new Set([unit.name]));
				}
				issueUnits.add(unit.mulId);
			}
			if (this.options.allowedRules && !this.options.allowedRules.includes(unit.rulesLevel)) {
				if (issueList.has("Invalid Rules")) {
					issueList.get("Invalid Rules")?.add(unit.name);
				} else {
					issueList.set("Invalid Rules", new Set([unit.name]));
				}
				issueUnits.add(unit.mulId);
			}
			if (this.options.disallowUnique && this.resultList.uniqueList.includes(unit.mulId)) {
				if (issueList.has("Unique units")) {
					issueList.get("Unique units")?.add(unit.name);
				} else {
					issueList.set("Unique units", new Set([unit.name]));
				}
				issueUnits.add(unit.mulId);
			}
			if (this.options.disallowedAbilities) {
				let prohibittedAbility = false;
				for (const ability of unit.abilities.replaceAll(" ", "").split(",")) {
					if (this.options.disallowedAbilities.includes(ability)) {
						prohibittedAbility = true;
					}
				}
				if (prohibittedAbility) {
					if (issueList.has("Invalid ability")) {
						issueList.get("Invalid ability")?.add(unit.name);
					} else {
						issueList.set("Invalid ability", new Set([unit.name]));
					}
					issueUnits.add(unit.mulId);
				}
			}
			if (this.options.minSkill && unit.skill && this.options.minSkill > unit.skill) {
				if (issueList.has("Minimum skill")) {
					issueList.get("Minimum skill")?.add(unit.name);
				} else {
					issueList.set("Minimum skill", new Set([unit.name]));
				}
				issueUnits.add(unit.mulId);
			}
			if (this.options.maxSkill && unit.skill && this.options.maxSkill < unit.skill) {
				if (issueList.has("Maximum skill")) {
					issueList.get("Maximum skill")?.add(unit.name);
				} else {
					issueList.set("Maximum skill", new Set([unit.name]));
				}
				issueUnits.add(unit.mulId);
			}
		}
		if (this.options.unitLimits) {
			let groupedUnits = Object.groupBy(this.units, ({ subtype }) => subtype);
			for (const limit of this.options.unitLimits) {
				let count = 0;
				for (const type of limit.types) {
					count += groupedUnits[type]?.length ?? 0;
				}
				if (limit.max && count > limit.max) {
					issueList.set(`Maximum ${limit.types.join("/")}`, new Set([`${count}/${limit.max}`]));
					for (const unit of this.units) {
						if (limit.types.includes(unit.subtype)) {
							issueUnits.add(unit.mulId);
						}
					}
				}
			}
		}

		if (this.options.chassisLimits) {
			for (const limit of this.options.chassisLimits) {
				let filteredUnits = this.units.filter((unit) => { return limit.types.includes("All") || limit.types.includes(unit.subtype) })
				let chassisList = Object.groupBy(filteredUnits, ({ chassis }) => chassis);
				for (const [chassisKey, chassisValue] of Object.entries(chassisList)) {
					if (chassisValue?.length && limit.max && (chassisValue.length > limit.max)) {
						if (issueList.has("Maximum chassis")) {
							issueList.get("Maximum chassis")?.add(chassisKey);
						} else {
							issueList.set("Maximum chassis", new Set([chassisKey]));
						}
					}
				}
			}
		}

		if (this.options.variantLimits) {
			for (const limit of this.options.variantLimits) {
				let filteredUnits = this.units.filter((unit) => { return limit.types.includes("All") || limit.types.includes(unit.subtype) })
				let chassisList = Object.groupBy(filteredUnits, ({ chassis }) => chassis);
				for (const [chassisKey, chassisValue] of Object.entries(chassisList)) {
					let variantList = Object.groupBy(chassisValue!, ({ variant }) => variant);
					for (const [variantKey, variantValue] of Object.entries(variantList)) {
						if (variantValue?.length && limit.max && (variantValue.length > limit.max)) {
							if (issueList.has("Maximum variants")) {
								issueList.get("Maximum variants")?.add(variantKey);
							} else {
								issueList.set("Maximum variants", new Set([variantKey]));
							}
						}
					}
				}
			}
		}

		if (this.options.skillLimits) {
			for (const limit of this.options.skillLimits) {
				let groupedUnits = this.units.filter((unit)=>{return limit.types.includes(unit.skill?.toString() ?? "4")})
				if (limit.max && groupedUnits.length > limit.max) {
					if (issueList.has("Maximum skill limits")) {
						issueList.get("Maximum skill limits")?.add(limit.types.toString());
					} else {
						issueList.set("Maximum skill limits", new Set([limit.types.toString()]));
					}
				}
			}
		}
		return { issueList, issueUnits };
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
	async loadList(data: any) {
		const { era, faction, name, units, sublists, rules } = data;
		this.setOptions(rules.name);
		this.resultList.setOptions(rules.name);

		this.resultList.details.era = era;
		this.resultList.details.faction = faction;

		await this.resultList.loadUnits();

		this.details.name = name;
		this.details.era = era;
		this.details.faction = faction;
		this.details.general = this.resultList.general;
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
							this.resultList.resultList.find((result: Unit) => {
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
									rulesLevel: "Standard"
								});
							}
						}
					}
				} else {
					let unitToAdd = JSON.parse(
						JSON.stringify(
							this.resultList.resultList.find((result: Unit) => {
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
