import type { Unit } from "$lib/types/unit.js";
import { calculateTMM, getGeneralList, getMULResults } from "$lib/utilities/bt-utils";
import type { Filter } from "$lib/types/filter";
import { deserialize } from "$app/forms";
import { filters as filtersImport, additionalFilters as additionalFiltersImport } from "$lib/data/filters";
import type { Options } from "./options";
import { ruleSets } from "./options";
import customCards from "$lib/data/customCards.json";

export function createResultList() {
	let status = $state<"waiting" | "loading" | "loaded">("waiting");
	let details = $state({ era: 0, faction: 0 });
	let general = $derived(getGeneralList(details.era, details.faction));

	let resultList = $state<Unit[]>([]);
	let uniqueList: any[] = [];

	let options = $state<Options>();
	let availableList = $derived.by(applyOptions);

	let filters = $state<Filter[]>(filtersImport);
	let additionalFilters = $state<Filter[]>(additionalFiltersImport);
	let sort = $state({ key: "", order: "asc" });
	let filteredList = $derived.by(filterList);

	async function loadUnits() {
		resultList = [];
		status = "loading";
		const response: any = deserialize(await (await fetch("/?/getUnits", { method: "POST", body: JSON.stringify({ era: details.era, faction: details.faction, general }) })).text());
		const unitList = response.data.unitList;
		uniqueList = response.data.uniqueList.map((unit: any) => {
			return unit.mulId;
		});

		unitList.forEach((unit: any) => {
			let tempMovement: { speed: number; type: string }[] = [];
			unit.move.split("/").forEach((movement: string) => {
				let [moveSpeed, moveType] = movement.split('"');
				tempMovement.push({ speed: parseInt(moveSpeed), type: moveType });
			});
			try {
				let formattedUnit: Unit = {
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
					overheat: unit.overheat,
					abilities: (unit.abilities ?? "-").replaceAll(",", ", "),
					imageLink: unit.image_url,
					rulesLevel: unit.rules,
					tonnage: unit.tonnage,
					date: unit.date_introduced,
					role: unit.role,
					availability: unit.availability
				};
				resultList.push(formattedUnit);
			} catch (error) {
				console.log(error);
				console.log(`${unit.Name} could not be added to result list`);
			}
		});
		if (resultList.length) {
			status = "loaded";
		}
	}

	function setOptions(newRules: string) {
		options = ruleSets.find((rules) => rules.name == newRules) ?? ruleSets[0];
	}

	function applyOptions() {
		let tempAvailableList: Unit[] = [];
		if (options) {
			if (resultList.length) {
				for (const unitList of customCards.unitPacks) {
					if (options.customUnitPacks?.includes(unitList.name)) {
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
								rulesLevel: "standard"
							});
						}
					}
				}
			}
			for (const unit of resultList) {
				if (options.allowedTypes && !options.allowedTypes?.includes(unit.subtype)) {
					continue;
				}
				if (options.allowedRules && !options.allowedRules?.includes(unit.rulesLevel)) {
					continue;
				}
				if (options.disallowUnique && uniqueList.includes(unit.mulId)) {
					continue;
				}
				if (options.disallowedAbilities) {
					let prohibited = false;
					for (const ability of options.disallowedAbilities) {
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
			tempAvailableList = [...resultList];
		}
		return tempAvailableList;
	}
	function filterList() {
		let tempResultList = [...availableList];
		filters.concat(additionalFilters).forEach((filter) => {
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
					if (filter.value) {
						if (filter.name == "move") {
							tempResultList = tempResultList.filter((unit) => {
								if (unit.move != undefined) {
									return unit.move[0].speed >= parseInt(filter.value!.toString());
								}
							});
						} else {
							tempResultList = tempResultList.filter((unit) => {
								return unit[filter.name] >= filter.value!;
							});
						}
					}
					if (filter.maxValue !== undefined && filter.maxValue !== null) {
						tempResultList = tempResultList.filter((unit) => {
							return unit[filter.name] <= filter.maxValue!;
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
							return !uniqueList.includes(unit.mulId);
						});
					}
			}
		});
		if (sort.key != "") {
			tempResultList = tempResultList.sort((a, b) => {
				let first;
				let second;
				if (sort.key == "move") {
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
				} else if (sort.key == "health (a+s)") {
					first = a.health;
					second = b.health;
				} else {
					first = a[sort.key];
					second = b[sort.key];
				}
				if (sort.order == "asc") {
					return first > second ? 1 : -1;
				} else {
					return first < second ? 1 : -1;
				}
			});
		}
		return tempResultList;
	}
	async function resetFilters() {
		filters.concat(additionalFilters).forEach((filter) => {
			if (filter.type == "number") {
				filter.value = undefined;
				filter.maxValue = undefined;
			} else if (filter.type == "numberGroup") {
				filter.values!.forEach((value, index, values) => {
					values[index] = {};
				});
			} else if (filter.type == "select") {
				filter.value = "any";
			} else if (filter.type != "unique") {
				filter.value = undefined;
			}
		});
	}

	return {
		get status() {
			return status;
		},
		get resultList() {
			return resultList;
		},
		get general() {
			return general;
		},
		setOptions,
		details,
		get availableList() {
			return availableList;
		},
		get filteredList() {
			return filteredList;
		},
		get filters() {
			return filters;
		},
		get additionalFilters() {
			return additionalFilters;
		},
		get options() {
			return options;
		},
		sort,
		loadUnits,
		add: (unit: Unit) => {
			resultList.push(JSON.parse(JSON.stringify(unit)));
		},
		clear: () => {
			resultList = [];
		},
		resetFilters
	};
}
