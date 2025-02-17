import type { MulUnit } from "$lib/types/unit.js";
import { getGeneralList } from "$lib/utilities/bt-utils";
import type { Filter } from "$lib/types/filter";
import { deserialize } from "$app/forms";
import { filters as filtersImport, additionalFilters as additionalFiltersImport } from "$lib/data/filters";
import type { Options } from "./options";
import { ruleSets } from "./options";
import customCards from "$lib/data/customCards.json";

export class ResultList {
	details = $state({ era: 0, faction: 0, general: -1 });

	resultList = $state<MulUnit[]>([]);
	uniqueList: any[] = [];

	options = $state<Options>();
	availableList = $derived.by(() => this.applyOptions());

	filters = $state<Filter[]>(filtersImport);
	additionalFilters = $state<Filter[]>(additionalFiltersImport);
	sort = $state({ key: "", order: "asc" });
	filteredList = $derived.by(() => this.filterList());

	status = $state(this.initialLoad());

	initialLoad() {
		return new Promise((resolve, reject) => {
			const existingList = localStorage.getItem("last-list");
			if (existingList) {
				const existingData = JSON.parse(existingList);
				this.details.era = existingData.era ?? 0;
				this.details.faction = existingData.faction ?? 0;
				this.details.general = existingData.general ?? getGeneralList(this.details.era, this.details.faction);
			}
			this.loadUnits().then(() => {
				if (this.resultList.length) {
					resolve("Units Loaded");
				} else {
					reject("Units failed to load");
				}
			});
		});
	}

	loadNewResults() {
		this.status = new Promise((resolve, reject) => {
			this.loadUnits().then(() => {
				if (this.resultList.length) {
					resolve("Units Loaded");
				} else {
					reject("Units failed to load");
				}
			});
		});
	}

	async loadUnits() {
		if (this.details.era < 0 || undefined) {
			this.details.era = 0;
		}
		if (this.details.faction < 0 || undefined) {
			this.details.faction = 0;
		}
		this.resultList = [];
		const response: any = deserialize(
			await (await fetch("/?/getUnits", { method: "POST", body: JSON.stringify({ era: this.details.era, faction: this.details.faction, general: this.details.general }) })).text()
		);
		const unitList = response.data.unitList;
		this.uniqueList = response.data.uniqueList.map((unit: any) => {
			return unit.mulId;
		});

		unitList.forEach((unit: any) => {
			let tempMovement: { speed: number; type: string }[] = [];
			unit.move.split("/").forEach((movement: string) => {
				let moveSpeed = movement.replaceAll('"', "").match(/\d+/) ?? "0";
				let moveType = movement.replaceAll('"', "").match(/\D+/) ?? "";
				tempMovement.push({ speed: parseInt(moveSpeed[0]), type: moveType[0] });
			});
			try {
				//{"speed": 6,"type": "t" }

				let formattedUnit: MulUnit = {
					mulId: unit.mulId,
					name: unit.name,
					class: unit.class,
					variant: unit.variant,
					type: unit.type,
					subtype: unit.subtype.toUpperCase(),
					pv: unit.pv,
					cost: unit.pv,
					skill: 4,
					size: unit.size,
					move: tempMovement,
					tmm: unit.tmm,
					health: unit.armor + unit.structure,
					armor: unit.armor,
					structure: unit.structure,
					damageS: unit.damage_s,
					damageSMin: unit.damage_s_min,
					damageM: unit.damage_m,
					damageMMin: unit.damage_m_min,
					damageL: unit.damage_l,
					damageLMin: unit.damage_l_min,
					damageE: unit.damage_e,
					damageEMin: unit.damage_e_min,
					overheat: unit.overheat,
					abilities: (unit.abilities ?? "-").replaceAll(",", ", "),
					imageLink: unit.image_url,
					rulesLevel: unit.rules,
					tonnage: unit.tonnage,
					date: unit.date_introduced,
					role: unit.role,
					availability: unit.availability,
					technology: unit.technology
				};
				this.resultList.push(formattedUnit);
			} catch (error) {
				console.log(error);
				console.log(`${unit.Name} could not be added to result list`);
			}
		});
	}

	setOptions(newRules: string) {
		this.options = ruleSets.find((rules) => rules.name == newRules) ?? ruleSets[0];
	}

	applyOptions() {
		let tempAvailableList: MulUnit[] = [];
		if (this.options) {
			if (this.resultList.length) {
				for (const unitList of customCards.unitPacks) {
					if (this.options.customUnitPacks?.includes(unitList.name)) {
						for (const unit of unitList.units) {
							tempAvailableList.push({
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
			}
			for (const unit of this.resultList) {
				if (this.options.allowedTypes && !this.options.allowedTypes?.includes(unit.subtype)) {
					continue;
				}
				if (this.options.allowedRules && !this.options.allowedRules?.includes(unit.rulesLevel)) {
					continue;
				}
				if (this.options.disallowUnique && this.uniqueList.includes(unit.mulId)) {
					continue;
				}
				if (this.options.disallowedAbilities) {
					let prohibited = false;
					for (const ability of this.options.disallowedAbilities) {
						if (unit.abilities.includes(ability)) {
							prohibited = true;
						}
					}
					if (prohibited) {
						continue;
					}
				}
				tempAvailableList.push(unit);
			}
		} else {
			tempAvailableList = [...this.resultList];
		}
		return tempAvailableList;
	}
	filterList() {
		let tempResultList = [...this.availableList];
		this.filters.concat(this.additionalFilters).forEach((filter) => {
			switch (filter.type) {
				case "string":
				case "select":
					if (filter.value && filter.value != "any") {
						tempResultList = tempResultList.filter((unit) => {
							if (unit[filter.name] != null) {
								return unit[filter.name].toLowerCase().includes(filter.value!.toString().toLowerCase());
							}
						});
					}
					break;
				case "number":
					if (filter.valueMin) {
						tempResultList = tempResultList.filter((unit) => {
							return unit[filter.name] >= filter.valueMin!;
						});
					}
					if (filter.valueMax !== undefined && filter.valueMax !== null) {
						tempResultList = tempResultList.filter((unit) => {
							return unit[filter.name] <= filter.valueMax!;
						});
					}
					break;
				case "numberGroup":
					filter.values!.forEach((value, index) => {
						if (value.min) {
							tempResultList = tempResultList.filter((unit) => {
								return unit[filter.properties![index]] >= value.min!;
							});
						}
						if (value.max !== undefined && value.max !== null) {
							tempResultList = tempResultList.filter((unit) => {
								return unit[filter.properties![index]] <= value.max!;
							});
						}
					});

					break;
				case "movement":
					if (filter.speedMaxValue || filter.speedMinValue || filter.typeValue != "any") {
						tempResultList = tempResultList.filter((unit) => {
							if (unit.move === undefined) {
								return false;
							}

							let meetsType = false,
								meetsMinSpeed = false,
								meetsMaxSpeed = false;
							for (const move of unit.move) {
								if (filter.typeValue == move.type || filter.typeValue == "any") {
									meetsType = true;
									if (!filter.speedMinValue || move.speed >= filter.speedMinValue) {
										meetsMinSpeed = true;
									}
									if (!filter.speedMaxValue || move.speed <= filter.speedMaxValue) {
										meetsMaxSpeed = true;
									}
								}
							}

							return meetsType && meetsMinSpeed && meetsMaxSpeed;
						});
					}
					break;
				case "abilities":
					if (filter.value) {
						tempResultList = tempResultList.filter((unit) => {
							let searchedAbilities = filter.value!.toString().split(",");
							let allFound = true;
							searchedAbilities.forEach((ability) => {
								let stepFound = false;
								let steps = ability.split("^");
								steps.forEach((step) => {
									if (unit[filter.name].toLowerCase().includes(step.trim().toLowerCase())) {
										stepFound = true;
									}
								});
								if (!stepFound) {
									allFound = false;
								}
							});
							return allFound;
						});
					}
					break;
				case "unique":
					if (filter.checked == false) {
						tempResultList = tempResultList.filter((unit) => {
							return !this.uniqueList.includes(unit.mulId);
						});
					}
			}
		});
		if (this.sort.key != "") {
			tempResultList = tempResultList.sort((a, b) => {
				let first;
				let second;
				if (this.sort.key == "move") {
					if (a.move == undefined) {
						first = 0;
					} else {
						first = a.move[0].speed;
					}
					if (b.move == undefined) {
						second = 0;
					} else {
						second = b.move[0].speed;
					}
				} else if (this.sort.key == "health (a+s)") {
					first = a.health;
					second = b.health;
				} else {
					first = a[this.sort.key];
					second = b[this.sort.key];
				}
				if (this.sort.order == "asc") {
					return first > second ? 1 : -1;
				} else {
					return first < second ? 1 : -1;
				}
			});
		}
		return tempResultList;
	}

	async resetFilters() {
		this.filters.concat(this.additionalFilters).forEach((filter) => {
			if (filter.type == "number") {
				filter.valueMin = undefined;
				filter.valueMax = undefined;
			} else if (filter.type == "numberGroup") {
				filter.values!.forEach((value, index, values) => {
					values[index] = {};
				});
			} else if (filter.type == "select") {
				filter.value = "any";
			} else if (filter.type == "movement") {
				filter.speedMaxValue = undefined;
				filter.speedMinValue = undefined;
				filter.typeValue = "any";
			} else if (filter.type != "unique") {
				filter.value = "";
			}
		});
	}

	clear() {
		this.resultList = [];
	}
}
