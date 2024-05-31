import type { Unit } from "$lib/types/unit.js";
import { calculateTMM, getGeneralList, getMULResults } from "$lib/utilities/bt-utils";
import type { filter } from "$lib/types/filter";
import { deserialize } from "$app/forms";
import { filters as filtersImport, additionalFilters as additionalFiltersImport } from "$lib/data/filters";
import type { Options } from "./options";
import { ruleSets } from "./options";
import customCards from "./customCards.json";

export function createResultList() {
	let details = $state({ era: -1, faction: -1 });
	let general = $derived(getGeneralList(details.era, details.faction));

	let resultList = $state<Unit[]>([]);
	let uniqueList: any[] = [];

	let options = $state<Options>();
	let availableList = $derived.by(applyOptions);

	let filters = $state<filter[]>(filtersImport);
	let additionalFilters = $state<filter[]>(additionalFiltersImport);
	let sort = $state({ key: "", order: "asc" });
	let filteredList = $derived.by(filterList);

	async function loadUnits() {
		let unitList: any[] = [];

		[unitList, uniqueList] = await Promise.all([getMULResults(details.era, details.faction, general), getMULResults(details.era, 4)]);

		unitList.forEach((unit: any) => {
			let tempMovement: { speed: number; type: string }[] = [];
			unit.BFMove.split("/").forEach((movement: string) => {
				let [moveSpeed, moveType] = movement.split('"');
				tempMovement.push({ speed: parseInt(moveSpeed), type: moveType });
			});
			const tmm = calculateTMM(tempMovement[0].speed);
			try {
				let formattedUnit: Unit = {
					id: unit.Id,
					name: unit.Name,
					class: unit.Class,
					variant: unit.Variant,
					type: unit.BFType.toUpperCase(),
					pv: unit.BFPointValue,
					cost: unit.BFPointValue,
					skill: 4,
					size: unit.BFSize,
					move: tempMovement,
					tmm: tmm,
					health: unit.BFArmor + unit.BFStructure,
					armor: unit.BFArmor,
					structure: unit.BFStructure,
					damageS: unit.BFDamageShort,
					damageSMin: unit.BFDamageShortMin,
					damageM: unit.BFDamageMedium,
					damageMMin: unit.BFDamageMediumMin,
					damageL: unit.BFDamageLong,
					damageLMin: unit.BFDamageLongMin,
					overheat: unit.BFOverheat,
					abilities: (unit.BFAbilities ?? "-").replaceAll(",", ", "),
					imageLink: unit.ImageUrl,
					rulesLevel: unit.Rules,
					tonnage: unit.Tonnage,
					date: unit.DateIntroduced,
					role: unit.Role.Name
				};
				resultList.push(formattedUnit);
			} catch (error) {
				console.log(error);
				console.log(`${unit.Name} could not be added to result list`);
			}
		});
	}
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
				resultList.push(formattedUnit);
			} catch (error) {
				console.log(error);
				console.log(`${unit.Name} could not be added to result list`);
			}
		});
	}

	function setOptions(newRules: string) {
		options = ruleSets.find((rules) => rules.name == newRules) ?? ruleSets[0];
	}

	function applyOptions() {
		let tempAvailableList: Unit[] = [];
		if (options) {
			if (resultList.length) {
				for (const cardPack of customCards.cardpacks) {
					if (options.customCardPacks?.includes(cardPack.name)) {
						for (const unit of cardPack.units) {
							tempAvailableList.push({
								id: unit.id,
								type: unit.type,
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
				if (options.allowedTypes && !options.allowedTypes?.includes(unit.type)) {
					continue;
				}
				if (options.allowedRules && !options.allowedRules?.includes(unit.rulesLevel)) {
					continue;
				}
				if (
					options.disallowUnique &&
					uniqueList.find((tempUnique) => {
						return tempUnique.Id == unit.id;
					})
				) {
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
		filters.forEach((filter) => {
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
					if (filter.maxValue != null) {
						tempResultList = tempResultList.filter((unit) => {
							return unit[filter.name] <= filter.maxValue!;
						});
					}
					break;
				case "numberGroup":
					filter.values!.forEach((value, index) => {
						if (value.min) {
							tempResultList = tempResultList.filter((unit) => {
								console.log(filter.properties![index]);
								console.log(unit);
								return unit[filter.properties![index]] >= value.min!;
							});
						}
						if (value.max) {
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
			}
		});
		additionalFilters.forEach((filter) => {
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
					if (filter.maxValue != null) {
						tempResultList = tempResultList.filter((unit) => {
							return unit[filter.name] <= filter.maxValue!;
						});
					}
					break;
				case "numberGroup":
					filter.values!.forEach((value, index) => {
						if (value.min) {
							tempResultList = tempResultList.filter((unit) => {
								console.log(filter.properties![index]);
								console.log(unit);
								return unit[filter.properties![index]] >= value.min!;
							});
						}
						if (value.max) {
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
			return resultList;
		},
		get general() {
			return general;
		},
		setOptions,
		details,
		get filtered() {
			return filteredList;
		},
		get filters() {
			return filters;
		},
		get additionalFilters() {
			return additionalFilters;
		},
		sort,
		loadUnits,
		loadUnitsSql,
		add: (unit: Unit) => {
			resultList.push(JSON.parse(JSON.stringify(unit)));
		},
		clear: () => {
			resultList = [];
		},
		resetFilters
	};
}

export const resultList = createResultList();
