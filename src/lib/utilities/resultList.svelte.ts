import type { Unit } from "$lib/types/unit.js";
import { calculateTMM, getGeneralList, getMULResults } from "$lib/utilities/bt-utils";
import type { filter } from "$lib/types/filter";

export function createResultList() {
	let results = $state<Unit[]>([]);
	let details = $state({ era: -1, faction: -1 });

	let general = $derived(getGeneralList(details.era, details.faction));
	let uniqueList: any[] = [];
	let customCards: any;
	let restrictions: any;

	let filters = $state<filter[]>([]);
	let sort = $state({ key: "", order: "asc" });
	let filtered = $derived.by(() => {
		let tempresultList = [...results];
		filters.forEach((filter) => {
			switch (filter.type) {
				case "string":
				case "select":
					if (filter.value != "" && filter.value != "any") {
						tempresultList = tempresultList.filter((unit) => {
							if (unit[filter.name] != null) {
								return unit[filter.name].toLowerCase().includes(filter.value.toString().toLowerCase());
							}
						});
					}
					break;
				case "min":
					if (filter.value != 0 && filter.value != null) {
						if (filter.name == "move") {
							tempresultList = tempresultList.filter((unit) => {
								if (unit.move != undefined) {
									return unit.move[0].speed >= parseInt(filter.value.toString());
								}
							});
						} else {
							tempresultList = tempresultList.filter((unit) => {
								return unit[filter.name] >= filter.value;
							});
						}
					}
					break;
				case "max":
					if (filter.value != filter.default && filter.value != null) {
						tempresultList = tempresultList.filter((unit) => {
							return unit[filter.name] <= filter.value;
						});
					}
					break;
				case "minMax":
					if (filter.value != 0 && filter.value != null) {
						tempresultList = tempresultList.filter((unit) => {
							return unit[filter.name] >= filter.value;
						});
					}
					if (filter.maxValue != filter.maxDefault && filter.maxValue != null) {
						tempresultList = tempresultList.filter((unit) => {
							return unit[filter.name] <= filter.maxValue!;
						});
					}
					break;
				case "minGroup":
					filter.values!.forEach((value, index) => {
						if (value != 0 && value != null) {
							tempresultList = tempresultList.filter((unit) => {
								return unit[filter.properties![index]] >= value;
							});
						}
					});

					break;
				case "abilities":
					if (filter.value != "") {
						tempresultList = tempresultList.filter((unit) => {
							let searchedAbilities = filter.value.toString().split(",");
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

	async function loadUnits() {
		let unitList: any[] = [];

		[unitList, uniqueList] = await Promise.all([getMULResults(details.era, details.faction, general), getMULResults(details.era, 4)]);

		if (customCards != undefined) {
			if (unitList.length) {
				customCards.units.forEach((unit: any) => {
					results.push({
						id: unit.id,
						type: unit.type,
						name: unit.name,
						class: unit.class,
						variant: unit.variant,
						pv: unit.pv,
						cost: unit.pv,
						abilities: unit.abilities
					});
				});
			}
		}
		unitList.forEach((unit: any) => {
			let unique =
				uniqueList.find((result) => {
					return result.Id == unit.Id;
				}) != undefined;

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
				if (restrictions == undefined) {
					results.push(formattedUnit);
				} else if (restrictions(formattedUnit, unique)) {
					results.push(formattedUnit);
				}
			} catch (error) {
				console.log(error);
				console.log(`${unit.Name} could not be added to result list`);
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
		set customCards(cards: any) {
			customCards = cards;
		},
		get filtered() {
			return filtered;
		},
		get filters() {
			return filters;
		},
		set filters(filterList: filter[]) {
			filters = filterList;
		},
		sort,
		loadUnits,
		add: (unit: Unit) => {
			results.push(JSON.parse(JSON.stringify(unit)));
		},
		clear: () => {
			results = [];
		}
	};
}

export const resultList = createResultList();
