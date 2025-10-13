import type { MulUnit } from "$lib/types/listTypes";
import { getGeneralList } from "$lib/utilities/genericBattletechUtilities";
import type { Filter } from "./filter";
import { deserialize } from "$app/forms";
import { filters as filtersImport, additionalFilters as additionalFiltersImport } from "$lib/data/filters";
import type { Ruleset } from "./rulesets";
import { ruleSets } from "./rulesets";

type SearchConstraint = {
	equals?: number;
	min?: number;
	max?: number;
};

type SearchTerm = {
	name: string;
	extraType?: string;
	value?: SearchConstraint;
	medium?: SearchConstraint;
	long?: SearchConstraint;
	extreme?: SearchConstraint;
	exactMatch?: boolean;
};

function parseSearchConstraint(constraintString?: string) {
	if (constraintString === undefined || constraintString == "") {
		return undefined;
	}
	let constraint: SearchConstraint = {};
	let conditionIndex = constraintString.search(/[+\-]/);
	if (conditionIndex == -1) {
		constraint.equals = Number(constraintString);
	} else {
		const condition = constraintString.charAt(conditionIndex);
		const value = Number(constraintString.slice(0, conditionIndex));
		if (condition == "+") {
			constraint.min = value;
		} else if (condition == "-") {
			constraint.max = value;
		} else {
			console.error("Unrecognized constraint: ", { condition });
		}
	}
	return constraint;
}

function compareValues(searchTerm?: SearchConstraint, unitAbilityValue?: number) {
	let match = true;
	if (searchTerm !== undefined) {
		if (searchTerm.equals !== undefined && searchTerm.equals != unitAbilityValue) {
			match = false;
		}
		if (searchTerm.min !== undefined && (unitAbilityValue === undefined || searchTerm.min > unitAbilityValue)) {
			match = false;
		}
		if (searchTerm.max !== undefined && unitAbilityValue !== undefined && searchTerm.max < unitAbilityValue) {
			match = false;
		}
	}
	return match;
}

export class ResultList {
	#eras = $state<number[]>([]);
	#factions = $state<number[]>([]);

	selectedEras = $state<string[]>([]);
	selectedFactions = $state<string[]>([]);

	eraSearchType = $state<"any" | "every">("any");
	factionSearchType = $state<"any" | "every">("any");

	constructor(initEras: number[], initFactions: number[]) {
		this.#eras = initEras;
		this.selectedEras = initEras.map((e) => e.toString());
		this.#factions = initFactions;
		this.selectedFactions = initFactions.map((f) => f.toString());
	}

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
	uniqueList = $state<number[]>([]);
	customUnits = $state<MulUnit[]>([]);
	taggedUnits = $state<string[]>([]);

	options = $state<Ruleset>();
	filterByRules = $state(true);
	availableList = $derived.by(() => {
		let availableUnits = this.resultList.concat(this.generalList);
		availableUnits = [...new Map(availableUnits.map((u) => [u.id, u]))].map((v) => v[1]);

		if (this.taggedUnits.length) {
			availableUnits = availableUnits.filter((u) => {
				if (u.group && u.group != "") {
					return this.taggedUnits.includes(u.group);
				}
				return this.taggedUnits.includes(u.class);
			});
		}
		availableUnits.sort((a, b) => {
			return (a.tonnage ?? 0) - (b.tonnage ?? 0);
		});
		return availableUnits;
	});

	restrictedList = $derived.by(() => this.applyOptions());

	filters = $state<Filter[]>(filtersImport);
	additionalFilters = $state<Filter[]>(additionalFiltersImport);
	sort = $state<{ key: string; order: string; extra?: any }>({ key: "", order: "asc" });
	filteredList = $derived(this.filterList(this.filters, this.additionalFilters));

	status = $state();
	loadResults() {
		this.#eras = this.selectedEras.map((era) => {
			return Number(era);
		});
		this.#factions = this.selectedFactions.map((faction) => {
			return Number(faction);
		});
		this.status = new Promise((resolve, reject) => {
			this.loadUnits().then((message) => {
				if (message == "Units Loaded") {
					resolve(message);
				} else if (message == "No Units Found") {
					resolve(message);
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
					id: unit.id,
					mulId: unit.mulId,
					name: unit.name,
					group: unit.group,
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
					abilities: unit.abilities != "-" ? JSON.parse(unit.abilities) : [],
					imageLink: unit.image_url,
					rulesLevel: unit.rules,
					tonnage: unit.tonnage,
					date: unit.date_introduced,
					role: unit.role,
					availability: unit.availability,
					technology: unit.technology,
					threshold: unit.threshold
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
			await (
				await fetch("/?/getUnits", {
					method: "POST",
					body: JSON.stringify({ eras: this.#eras, factions: this.#factions, general: this.general, eraSearchType: this.eraSearchType, factionSearchType: this.factionSearchType })
				})
			).text()
		);

		this.resultList = [];
		this.uniqueList = [];
		this.generalList = [];

		if (response.data.message == "Units Loaded") {
			const unitList = response.data.unitList;
			this.uniqueList = response.data.uniqueList.map((unit: any) => {
				return unit.mulId;
			});
			const generalList = response.data.generalList;

			this.resultList = this.loadUnitsFromResponse(unitList);
			if (this.includeGeneral) {
				this.generalList = this.loadUnitsFromResponse(generalList);
			}
		}

		return response.data.message;
	}

	async setOptions(newRules: string) {
		this.options = ruleSets.find((rules) => rules.name == newRules) ?? ruleSets[0];
		const response: any = deserialize(await (await fetch("/?/getCustomUnits", { method: "POST", body: JSON.stringify({ unitPacks: this.options.customUnitPacks }) })).text());
		this.customUnits = [];
		if (response.type == "success") {
			for (const unit of response.data.customUnits) {
				this.customUnits.push({
					id: unit.mulId,
					mulId: unit.mulId,
					type: unit.type,
					subtype: unit.type,
					name: unit.name,
					group: unit.group ?? "",
					class: unit.class,
					variant: unit.variant,
					pv: unit.pv,
					cost: unit.pv,
					abilities: unit.abilities != "-" ? JSON.parse(unit.abilities) : [],
					rulesLevel: "Standard"
				});
			}
		}
	}
	setParameters(eras: number[], factions: number[]) {
		this.#eras = eras;
		this.selectedEras = eras.map((e) => e.toString());
		this.#factions = factions;
		this.selectedFactions = factions.map((f) => f.toString());
	}
	applyOptions() {
		let tempRestrictedList: MulUnit[] = [];
		if (this.options && this.filterByRules) {
			if (this.availableList.length) {
				tempRestrictedList = tempRestrictedList.concat(this.customUnits);
			}
			for (const unit of this.availableList) {
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
					for (const disallowedAbility of this.options.disallowedAbilities) {
						if (
							unit.abilities.find((ability) => {
								return ability.name == disallowedAbility;
							})
						) {
							prohibited = true;
						}
					}
					if (prohibited) {
						continue;
					}
				}
				tempRestrictedList.push(unit);
			}
		} else {
			tempRestrictedList = [...this.availableList];
		}
		return tempRestrictedList;
	}
	filterList(filters: Filter[], additionalFilters: Filter[]) {
		let tempResultList = [...this.restrictedList];
		filters.concat(additionalFilters).forEach((filter) => {
			switch (filter.type) {
				case "string":
					if (filter.value && filter.value != "any") {
						tempResultList = tempResultList.filter((unit) => {
							if (unit[filter.name] != null) {
								return unit[filter.name]
									.normalize("NFD")
									.replace(/[\u0300-\u036f]/g, "")
									.toLowerCase()
									.includes(
										filter
											.value!.toString()
											.normalize("NFD")
											.replace(/[\u0300-\u036f]/g, "")
											.toLowerCase()
									);
							}
						});
					}
					break;
				case "select":
					if (filter.value.length) {
						tempResultList = tempResultList.filter((unit) => {
							return filter.value.includes(unit[filter.name]);
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
					if (filter.speedMaxValue || filter.speedMinValue || filter.typeValue.length) {
						tempResultList = tempResultList.filter((unit) => {
							if (unit.move === undefined) {
								return false;
							}

							let meetsType = false,
								meetsMinSpeed = false,
								meetsMaxSpeed = false;
							for (const move of unit.move) {
								if (filter.typeValue.includes(move.type) || !filter.typeValue.length) {
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
						const rawSearchBrackets = [...filter.value.matchAll(/\([^)]*\)/g)].map((match) => match[0].replaceAll(/[\s\(\)]/g, "").split(","));
						const rawNonBrackets = filter.value.replaceAll(/\([^)]*\)/g, "");
						let rawSearchArray = rawNonBrackets
							.split(",")
							.map((ability) => ability.trim())
							.filter((split) => split != "");
						let searchTermArray: SearchTerm[] = [];
						let searchBracketArray: SearchTerm[][] = [];

						for (let rawSearchTerm of rawSearchArray) {
							const exactMatch = rawSearchTerm[0] == "=";
							if (exactMatch) {
								rawSearchTerm = rawSearchTerm.slice(1);
							}
							let searchTerm: SearchTerm;

							const rawArtSearch = rawSearchTerm.match(/(ART)/i);
							if (rawArtSearch !== null) {
								const valueStartIndex = rawSearchTerm.search(/\d/);
								if (valueStartIndex == -1) {
									searchTerm = { name: "ART", extraType: rawSearchTerm.slice(3, rawSearchTerm.length) };
								} else {
									searchTerm = { name: "ART", extraType: rawSearchTerm.slice(3, valueStartIndex), exactMatch };
									searchTerm.value = parseSearchConstraint(rawSearchTerm.slice(valueStartIndex));
								}
							} else {
								const rawArray: string[] = rawSearchTerm.split("/");
								const valueStartIndex = rawArray[0].search(/(?<!^c)\d/i);
								if (valueStartIndex != -1) {
									searchTerm = { name: rawSearchTerm.slice(0, valueStartIndex) };
									rawArray[0] = rawArray[0].slice(valueStartIndex, rawArray[0].length);
								} else {
									searchTerm = { name: rawSearchTerm };
									rawArray[0] = "";
								}
								if (rawArray.length == 1) {
									if (rawArray[0] != "") {
										searchTerm.value = parseSearchConstraint(rawArray[0]);
									}
								} else {
									searchTerm.value = parseSearchConstraint(rawArray[0]);
									searchTerm.medium = parseSearchConstraint(rawArray[1]);
									searchTerm.long = parseSearchConstraint(rawArray[2]);
									searchTerm.extreme = parseSearchConstraint(rawArray[3]);
								}
							}
							searchTerm.exactMatch = exactMatch;
							searchTermArray.push(searchTerm);
						}
						for (const bracket of rawSearchBrackets) {
							const bracketTermArray: SearchTerm[] = [];
							for (const rawSearchTerm of bracket) {
								let searchTerm: SearchTerm;
								const rawArtSearch = rawSearchTerm.match(/(ART)/i);
								if (rawArtSearch !== null) {
									const valueStartIndex = rawSearchTerm.search(/\d/);
									if (valueStartIndex == -1) {
										searchTerm = { name: "ART", extraType: rawSearchTerm.slice(3, rawSearchTerm.length) };
									} else {
										searchTerm = { name: "ART", extraType: rawSearchTerm.slice(3, valueStartIndex) };
										searchTerm.value = parseSearchConstraint(rawSearchTerm.slice(valueStartIndex));
									}
								} else {
									const rawArray: string[] = rawSearchTerm.split("/");
									const valueStartIndex = rawArray[0].search(/(?<!^c)\d/i);
									if (valueStartIndex != -1) {
										searchTerm = { name: rawSearchTerm.slice(0, valueStartIndex) };
										rawArray[0] = rawArray[0].slice(valueStartIndex, rawArray[0].length);
									} else {
										searchTerm = { name: rawSearchTerm };
										rawArray[0] = "";
									}
									if (rawArray.length == 1) {
										if (rawArray[0] != "") {
											searchTerm.value = parseSearchConstraint(rawArray[0]);
										}
									} else {
										searchTerm.value = parseSearchConstraint(rawArray[0]);
										searchTerm.medium = parseSearchConstraint(rawArray[1]);
										searchTerm.long = parseSearchConstraint(rawArray[2]);
										searchTerm.extreme = parseSearchConstraint(rawArray[3]);
									}
								}
								bracketTermArray.push(searchTerm);
							}
							searchBracketArray.push(bracketTermArray);
						}
						tempResultList = tempResultList.filter((unit) => {
							let allFound = true;
							for (const searchTerm of searchTermArray) {
								const unitAbility = unit.abilities.find(({ name }) => {
									if (searchTerm.exactMatch) {
										return name.toLowerCase() == searchTerm.name.toLowerCase();
									} else {
										return name.toLowerCase().includes(searchTerm.name.toLowerCase());
									}
								});
								if (!unitAbility) {
									allFound = false;
								} else {
									if (searchTerm.extraType !== undefined && unitAbility.name == "ART" && !unitAbility.artType?.toLowerCase().includes(searchTerm.extraType.toLowerCase())) {
										allFound = false;
									}
									if (searchTerm.value !== undefined) {
										for (const unitValue of [unitAbility.s, unitAbility.v, unitAbility.vhid]) {
											if (unitValue !== undefined) {
												if (!compareValues(searchTerm.value, unitValue)) {
													allFound = false;
												}
											}
										}
									}
									if (!compareValues(searchTerm.medium, unitAbility.m)) {
										allFound = false;
									}
									if (!compareValues(searchTerm.long, unitAbility.l)) {
										allFound = false;
									}
									if (!compareValues(searchTerm.extreme, unitAbility.e)) {
										allFound = false;
									}
								}
							}
							for (const bracket of searchBracketArray) {
								let anyFound = false;
								for (const searchTerm of bracket) {
									let stepFound = true;
									const unitAbility = unit.abilities.find(({ name }) => {
										if (searchTerm.exactMatch) {
											return name.toLowerCase() == searchTerm.name.toLowerCase();
										} else {
											return name.toLowerCase().includes(searchTerm.name.toLowerCase());
										}
									});
									if (!unitAbility) {
										stepFound = false;
									} else {
										if (searchTerm.extraType !== undefined && unitAbility.name == "ART" && !unitAbility.artType?.toLowerCase().includes(searchTerm.extraType.toLowerCase())) {
											stepFound = false;
										}
										if (searchTerm.value !== undefined) {
											for (const unitValue of [unitAbility.s, unitAbility.v, unitAbility.vhid]) {
												if (unitValue !== undefined) {
													if (!compareValues(searchTerm.value, unitValue)) {
														stepFound = false;
													}
												}
											}
										}
										if (!compareValues(searchTerm.medium, unitAbility.m)) {
											stepFound = false;
										}
										if (!compareValues(searchTerm.long, unitAbility.l)) {
											stepFound = false;
										}
										if (!compareValues(searchTerm.extreme, unitAbility.e)) {
											stepFound = false;
										}
									}
									if (stepFound) {
										anyFound = true;
									}
								}
								if (!anyFound) {
									allFound = false;
								}
							}
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
							if (a.abilities.find(({ name }) => name == "OVL")) {
								first += a.overheat ?? 0;
							}
							if (b.abilities.find(({ name }) => name == "OVL")) {
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
				filter.value = [];
			} else if (filter.type == "movement") {
				filter.speedMaxValue = undefined;
				filter.speedMinValue = undefined;
				filter.typeValue = [];
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
