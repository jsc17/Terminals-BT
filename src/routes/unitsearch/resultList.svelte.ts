import type { Unit } from "$lib/types/unit.js";
import { getGeneralList } from "$lib/utilities/bt-utils";
import type { filter } from "$lib/types/filter";
import { deserialize } from "$app/forms";
import { filters as filtersImport, additionalFilters as additionalFiltersImport } from "$lib/data/filters";

export function createResultList() {
	let results = $state<Unit[]>([]);
	let details = $state({ era: -1, faction: -1 });

	let general = $derived(getGeneralList(details.era, details.faction));
	let restrictions: any;

	let filters = $state<filter[]>(filtersImport);
	let additionalFilters = $state<filter[]>(additionalFiltersImport);

	let sort = $state({ key: "", order: "asc" });
	let filtered = $derived.by(() => {
		let tempresultList = [...results];
		filters.forEach((filter) => {
			switch (filter.type) {
				case "string":
				case "select":
					if (filter.value && filter.value != "any") {
						tempresultList = tempresultList.filter((unit) => {
							if (unit[filter.name] != null) {
								return unit[filter.name].toLowerCase().includes(filter.value!.toString().toLowerCase());
							}
						});
					}
					break;
				case "number":
					if (filter.value) {
						if (filter.name == "move") {
							tempresultList = tempresultList.filter((unit) => {
								if (unit.move != undefined) {
									return unit.move[0].speed >= parseInt(filter.value!.toString());
								}
							});
						} else {
							tempresultList = tempresultList.filter((unit) => {
								return unit[filter.name] >= filter.value!;
							});
						}
					}
					if (filter.maxValue != null) {
						tempresultList = tempresultList.filter((unit) => {
							return unit[filter.name] <= filter.maxValue!;
						});
					}
					break;
				case "numberGroup":
					filter.values!.forEach((value, index) => {
						if (value.min) {
							tempresultList = tempresultList.filter((unit) => {
								return unit[filter.properties![index]] >= value.min!;
							});
						}
						if (value.max) {
							tempresultList = tempresultList.filter((unit) => {
								return unit[filter.properties![index]] <= value.max!;
							});
						}
					});

					break;
				case "abilities":
					if (filter.value) {
						tempresultList = tempresultList.filter((unit) => {
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
			}
		});
		additionalFilters.forEach((filter) => {
			switch (filter.type) {
				case "string":
				case "select":
					if (filter.value && filter.value != "any") {
						tempresultList = tempresultList.filter((unit) => {
							if (unit[filter.name] != null) {
								return unit[filter.name].toLowerCase().includes(filter.value!.toString().toLowerCase());
							}
						});
					}
					break;
				case "number":
					if (filter.value) {
						if (filter.name == "move") {
							tempresultList = tempresultList.filter((unit) => {
								if (unit.move != undefined) {
									return unit.move[0].speed >= parseInt(filter.value!.toString());
								}
							});
						} else {
							tempresultList = tempresultList.filter((unit) => {
								return unit[filter.name] >= filter.value!;
							});
						}
					}
					if (filter.maxValue != null) {
						tempresultList = tempresultList.filter((unit) => {
							return unit[filter.name] <= filter.maxValue!;
						});
					}
					break;
				case "numberGroup":
					filter.values!.forEach((value, index) => {
						if (value.min) {
							tempresultList = tempresultList.filter((unit) => {
								return unit[filter.properties![index]] >= value.min!;
							});
						}
						if (value.max) {
							tempresultList = tempresultList.filter((unit) => {
								return unit[filter.properties![index]] <= value.max!;
							});
						}
					});

					break;
				case "abilities":
					if (filter.value) {
						tempresultList = tempresultList.filter((unit) => {
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
			}
		});
		if (sort.key != "") {
			tempresultList = tempresultList.sort((a, b) => {
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
		return tempresultList;
	});

	async function loadUnitsSql() {
		const response: any = deserialize(await (await fetch("/?/getAllUnits", { method: "POST", body: "" })).text());
		const unitList = response.data.unitList;

		unitList.forEach((unit: any) => {
			let tempMovement: { speed: number; type: string }[] = [];
			unit.move.split("/").forEach((movement: string) => {
				let [moveSpeed, moveType] = movement.split('"');
				tempMovement.push({ speed: parseInt(moveSpeed), type: moveType });
			});
			try {
				let formattedUnit: Unit = {
					id: unit.mulId,
					name: unit.name,
					class: unit.class,
					variant: unit.variant,
					type: unit.type.toUpperCase(),
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
					role: unit.role
				};
				if (restrictions == undefined) {
					results.push(formattedUnit);
				}
			} catch (error) {
				console.log(error);
				console.log(`${unit.Name} could not be added to result list`);
			}
		});
	}
	async function resetFilters() {
		filters.forEach((filter) => {
			if (filter.type == "number") {
				filter.value = undefined;
				filter.maxValue = undefined;
			} else if (filter.type == "numberGroup") {
				filter.values!.forEach((value, index, values) => {
					values[index] = {};
				});
			} else if (filter.type == "select") {
				filter.value = "any";
			} else {
				filter.value = undefined;
			}
		});
		additionalFilters.forEach((filter) => {
			if (filter.type == "number") {
				filter.value = undefined;
				filter.maxValue = undefined;
			} else if (filter.type == "numberGroup") {
				filter.values!.forEach((value, index, values) => {
					values[index] = {};
				});
			} else if (filter.type == "select") {
				filter.value = "any";
			} else {
				filter.value = undefined;
			}
		});
	}

	return {
		get results() {
			return results;
		},
		get general() {
			return general;
		},
		set restrictions(newRestriction: any) {
			restrictions = newRestriction;
		},
		details,
		get filtered() {
			return filtered;
		},
		get filters() {
			return filters;
		},
		get additionalFilters() {
			return additionalFilters;
		},
		sort,
		loadUnitsSql,
		add: (unit: Unit) => {
			results.push(JSON.parse(JSON.stringify(unit)));
		},
		clear: () => {
			results = [];
		},
		resetFilters
	};
}

export const resultList = createResultList();
