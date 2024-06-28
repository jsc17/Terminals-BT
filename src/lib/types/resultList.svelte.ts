import type { Unit } from "$lib/types/unit.js";
import { getGeneralList } from "$lib/utilities/bt-utils";
import  { type  Filter } from "$lib/types/filter";
import { deserialize } from "$app/forms";
import { filters, additionalFilters } from "$lib/data/filters";
import { type Options, ruleSets } from "./options";
import customCards from "$lib/data/customCards.json";

export class ResultList{
    details = $state({ era: -1, faction: -1 });
    general = $derived(getGeneralList(this.details.era, this.details.faction));

    resultList = $state<Unit[]>([]);
    uniqueList = $state<Unit[]>([]);

	options = $state<Options>(ruleSets[0]);
    availableList = $derived.by(this.applyOptions);

	filters = $state<Filter[]>(filters);
	additionalFilters = $state<Filter[]>(additionalFilters);
	sort = $state({ key: "", order: "asc" });
	filteredList = $derived.by(this.filterList);

    async loadUnitsSql() {
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
					role: unit.role
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
		let tempAvailableList: Unit[] = [];
		if (this.options) {
			if (this.resultList.length) {
				for (const cardPack of customCards.cardpacks) {
					if (this.options.customCardPacks?.includes(cardPack.name)) {
						for (const unit of cardPack.units) {
							tempAvailableList.push({
								mulId: unit.id,
								type: unit.type,
                                subtype: unit.type.toUpperCase(),
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
			for (const unit of this.resultList) {
				if (this.options.allowedTypes && !this.options.allowedTypes?.includes(unit.type)) {
					continue;
				}
				if (this.options.allowedRules && !this.options.allowedRules?.includes(unit.rulesLevel)) {
					continue;
				}
				if (
					this.options.disallowUnique &&
					this.uniqueList.find((tempUnique) => {
						return tempUnique.Id == unit.id;
					})
				) {
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
					filter.values!.forEach((value: any, index: number) => {
						if (value.min) {
							tempResultList = tempResultList.filter((unit) => {
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
							searchedAbilities.forEach((ability:string) => {
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
					filter.values!.forEach((value: any, index: number) => {
						if (value.min) {
							tempResultList = tempResultList.filter((unit) => {
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
							searchedAbilities.forEach((ability: string) => {
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
		filters.forEach((filter) => {
			if (filter.type == "number") {
				filter.value = undefined;
				filter.maxValue = undefined;
			} else if (filter.type == "numberGroup") {
				filter.values!.forEach((value: any, index: number, values: any) => {
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
				filter.values!.forEach((value: any, index: number, values: any) => {
					values[index] = {};
				});
			} else if (filter.type == "select") {
				filter.value = "any";
			} else {
				filter.value = undefined;
			}
		});
	}
}
