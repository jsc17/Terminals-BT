import type { MulUnit } from "$lib/types/unit.js";
import { getGeneralList } from "$lib/utilities/bt-utils";
import type { Filter } from "$lib/types/filter";
import { deserialize } from "$app/forms";
import { filters as filtersImport, additionalFilters as additionalFiltersImport } from "$lib/data/filters";
import type { Options } from "./options";
import { ruleSets } from "./options";
import customCards from "$lib/data/customCards.json";

export class ResultList {
	#eras = $state<number[]>([]);
	#factions = $state<number[]>([]);

	selectedEras = $state<string[]>([]);
	selectedFactions = $state<string[]>([]);

	eraSearchType = $state<"any" | "all">("any");
	factionSearchType = $state<"any" | "all">("any");

	get eras(): number[] {
		return this.#eras;
	}
	set eras(newValue: string[] | number[]) {
		this.selectedEras = newValue.map((value) => {
			return value.toString();
		});
		this.#eras = newValue.map((value) => {
			return Number(value);
		});
	}
	get factions(): number[] {
		return this.#factions;
	}
	set factions(newValue: string[] | number[]) {
		this.selectedFactions = newValue.map((value) => {
			return value.toString();
		});
		this.#factions = newValue.map((value) => {
			return Number(value);
		});
	}

	general = $derived.by(() => {
		if (this.selectedEras.length == 1 && this.selectedFactions.length == 1) {
			return getGeneralList(Number(this.selectedEras[0]), Number(this.selectedFactions[0]));
		} else {
			return -1;
		}
	});

	includeGeneral = $state(true);

	resultList = $state<MulUnit[]>([]);
	generalList = $state<MulUnit[]>([]);
	uniqueList: any[] = [];

	options = $state<Options>();
	availableList = $derived.by(() => {
		let availableUnits = this.resultList.concat(this.generalList);
		availableUnits = [...new Set(availableUnits)];
		availableUnits.sort((a, b) => {
			return (a.tonnage ?? 0) - (b.tonnage ?? 0);
		});
		return availableUnits;
	});

	restrictedList = $derived.by(() => this.applyOptions());

	filters = $state<Filter[]>(filtersImport);
	additionalFilters = $state<Filter[]>(additionalFiltersImport);
	sort = $state<{ key: string; order: string; extra?: any }>({ key: "", order: "asc" });
	filteredList = $derived.by(() => this.filterList());

	status = $state();

	loadResults() {
		this.#eras = this.selectedEras.map((era) => {
			return Number(era);
		});
		this.#factions = this.selectedFactions.map((faction) => {
			return Number(faction);
		});
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

	loadUnitsFromResponse(unitList: any[]) {
		let tempResultList: MulUnit[] = [];
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
				tempResultList.push(formattedUnit);
			} catch (error) {
				console.log(error);
				console.log(`${unit.Name} could not be added to result list`);
			}
		});
		return tempResultList;
	}

	async loadUnits() {
		const response: any = deserialize(
			await (await fetch("/?/getUnits", { method: "POST", body: JSON.stringify({ eras: this.#eras, factions: this.#factions, general: this.general, eraSearchType: this.eraSearchType, factionSearchType: this.factionSearchType }) })).text()
		);
		const unitList = response.data.unitList;
		this.uniqueList = response.data.uniqueList.map((unit: any) => {
			return unit.mulId;
		});
		const generalList = response.data.generalList;

		this.resultList = this.loadUnitsFromResponse(unitList);
		if (this.includeGeneral) {
			this.generalList = this.loadUnitsFromResponse(generalList);
		} else {
			this.generalList = [];
		}
	}

	setOptions(newRules: string) {
		this.options = ruleSets.find((rules) => rules.name == newRules) ?? ruleSets[0];
	}

	applyOptions() {
		let tempRestrictedList: MulUnit[] = [];
		if (this.options) {
			if (this.availableList.length) {
				for (const unitList of customCards.unitPacks) {
					if (this.options.customUnitPacks?.includes(unitList.name)) {
						for (const unit of unitList.units) {
							tempRestrictedList.push({
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
			for (const unit of this.availableList) {
				if (this.options.allowedTypes && !this.options.allowedTypes?.includes(unit.subtype)) {
					console.log("type", unit.name, unit.subtype);
					continue;
				}
				if (this.options.allowedRules && !this.options.allowedRules?.includes(unit.rulesLevel)) {
					console.log("rules", unit.name, unit.rulesLevel);
					continue;
				}
				if (this.options.disallowUnique && this.uniqueList.includes(unit.mulId)) {
					console.log("unique", unit.name);
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
						console.log("ability", unit.name, unit.abilities)
						continue;
					}
				}
				tempRestrictedList.push(unit);
			}
		} else {
			tempRestrictedList = [...this.resultList];
		}
		return tempRestrictedList;
	}
	filterList() {
		let tempResultList = [...this.restrictedList];
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
				} else if (this.sort.key == "damage") {
					if (this.sort.extra.type == "damageTotal") {
						first = (a.damageS ?? 0) + (a.damageM ?? 0) + (a.damageL ?? 0);
						second = (b.damageS ?? 0) + (b.damageM ?? 0) + (b.damageL ?? 0);
					} else {
						first = a[this.sort.extra.type];
						second = b[this.sort.extra.type];
					}
					if (this.sort.extra.includeOV) {
						if (this.sort.extra.type == "damageL") {
							if (a.abilities.toLowerCase().includes("ovl")) {
								first += a.overheat ?? 0;
							}
							if (b.abilities.toLowerCase().includes("ovl")) {
								second += b.overheat ?? 0;
							}
						} else {
							first += a.overheat ?? 0;
							second += b.overheat ?? 0;
						}
					}
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
		this.generalList = [];
		this.uniqueList = [];
		this.#eras = [];
		this.#factions = [];
		this.selectedEras = [];
		this.selectedFactions = [];
	}
}
