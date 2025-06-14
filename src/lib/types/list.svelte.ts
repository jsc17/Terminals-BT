import type { UnitV2, MulUnit, ListCode, ListCodeUnit, SCA, FormationV2, SublistV2, ResultList } from "$lib/types/";
import { getNewSkillCost } from "$lib/utilities/bt-utils";
import { getRules } from "$lib/types/";
import { getSCAfromId } from "./sca";
import { nanoid } from "nanoid";
import { loadMULUnit } from "$lib/utilities/load";

export class List {
	units: UnitV2[] = $state([]);
	formations: FormationV2[] = $state([{ id: "unassigned", name: "Unassigned units", type: "none", units: [] }]);
	sublists: SublistV2[] = $state([]);
	scaList: SCA[] = $state([]);

	details: { name: string; eras: number[]; factions: number[]; general: number } = $state({ name: "New List", eras: [], factions: [], general: -1 });
	rules = $state<string>("noRes");
	id: string = $state(crypto.randomUUID());

	unitCount = $derived(this.units.length);
	pv = $derived(
		Array.from(this.units.values()).reduce((total, current) => {
			return total + current.cost;
		}, 0)
	);

	stats = $derived.by(() => {
		let totalPV = 0,
			totalS = 0,
			totalM = 0,
			totalL = 0,
			totalHealth = 0,
			totalSize = 0,
			totalSkill = 0,
			unitCount = this.unitCount;

		this.units.forEach((unit) => {
			if (unit) {
				totalPV += unit.cost ?? 0;
				totalS += unit.baseUnit.damageS ?? 0;
				totalM += unit.baseUnit.damageM ?? 0;
				totalL += unit.baseUnit.damageL ?? 0;
				totalHealth += unit.baseUnit.health ?? 0;
				totalSize += unit.baseUnit.size ?? 0;
				totalSkill += unit.skill ?? 0;
			}
		});
		let avgS = 0,
			avgM = 0,
			avgL = 0,
			avgHealth = 0,
			avgSize = 0,
			avgSkill = 0;
		if (unitCount) {
			avgS = Number((totalS / unitCount).toFixed(2));
			avgM = Number((totalM / unitCount).toFixed(2));
			avgL = Number((totalL / unitCount).toFixed(2));
			avgHealth = Number((totalHealth / unitCount).toFixed(2));
			avgSkill = Number((totalSkill / unitCount).toFixed(2));
			avgSize = Number((totalSize / unitCount).toFixed(2));
		}
		return {
			totalS,
			totalM,
			totalL,
			totalHealth,
			avgS,
			avgM,
			avgL,
			avgHealth,
			avgSkill,
			avgSize
		};
	});

	resultList: ResultList;

	constructor(resultList: ResultList) {
		this.resultList = resultList;
	}

	options = $derived(getRules(this.rules));

	listCode = $derived.by(() => {
		let unitList: ListCodeUnit[] = [];
		this.units.forEach((unit) => {
			unitList.push({ id: unit.id, mulId: unit.baseUnit.mulId, skill: unit.skill, customization: unit.customization });
		});

		const newListCode: ListCode = {
			id: this.id,
			lcVersion: 2,
			name: this.details.name,
			eras: this.details.eras,
			factions: this.details.factions,
			rules: this.rules,
			units: unitList,
			formations: this.formations,
			sublists: this.sublists
		};
		if (this.scaList.length) {
			newListCode.scas = this.scaList.map(({ id }) => {
				return id;
			});
		}
		if (this.unitCount != 0 || localStorage.getItem("last-list") === null) {
			localStorage.setItem("last-list", JSON.stringify(newListCode));
		}

		return JSON.stringify(newListCode);
	});

	issues = $derived.by(() => {
		const issueList = new Map<string, Set<string>>();
		const issueUnits = new Set<string>();
		let issueMessage = "";

		if (this.options) {
			if (this.options.maxPv && this.pv > this.options.maxPv) {
				issueList.set("Max PV", new Set([`${this.pv}/${this.options.maxPv}`]));
			}
			if (this.options.maxUnits && this.unitCount > this.options.maxUnits) {
				issueList.set("Max Units", new Set([`${this.unitCount}/${this.options.maxUnits}`]));
			}
			if (this.options.eraFactionRestriction && (this.details.eras.length != 1 || this.details.factions.length != 1)) {
				issueList.set("Era/Faction", new Set(["Must select a single era and faction"]));
			}
			for (const unit of this.units) {
				if (
					this.options.eraFactionRestriction &&
					!this.resultList.restrictedList.find((result) => {
						return result.mulId == unit.baseUnit.mulId;
					})
				) {
					if (unit.baseUnit.mulId < 0) {
						issueMessage = "If a battlefield support unit is showing as unavailable, it might have been added using a different rules selection. Remove and re-add the unit";
					}
					if (issueList.has("Unavailable Unit")) {
						issueList.get("Unavailable Unit")?.add(unit.baseUnit.name);
					} else {
						issueList.set("Unavailable Unit", new Set([unit.baseUnit.name]));
					}
					issueUnits.add(unit.id!);
				}
				if (this.options.allowedTypes && !this.options.allowedTypes.includes(unit.baseUnit.subtype)) {
					if (issueList.has("Invalid Type")) {
						issueList.get("Invalid Type")?.add(unit.baseUnit.name);
					} else {
						issueList.set("Invalid Type", new Set([unit.baseUnit.name]));
					}
					issueUnits.add(unit.id!);
				}
				if (this.options.allowedRules && !this.options.allowedRules.includes(unit.baseUnit.rulesLevel)) {
					if (issueList.has("Invalid Rules Level")) {
						issueList.get("Invalid Rules Level")?.add(unit.baseUnit.name);
					} else {
						issueList.set("Invalid Rules Level", new Set([unit.baseUnit.name]));
					}
					issueUnits.add(unit.id!);
				}
				if (this.options.disallowUnique && this.resultList.uniqueList.includes(unit.baseUnit.mulId)) {
					if (issueList.has("Unique units")) {
						issueList.get("Unique units")?.add(unit.baseUnit.name);
					} else {
						issueList.set("Unique units", new Set([unit.baseUnit.name]));
					}
					issueUnits.add(unit.id!);
				}
				if (this.options.disallowedAbilities) {
					let prohibittedAbility = false;
					for (const ability of unit.baseUnit.abilities) {
						if (this.options.disallowedAbilities.includes(ability.name)) {
							prohibittedAbility = true;
						}
					}
					if (prohibittedAbility) {
						if (issueList.has("Invalid ability")) {
							issueList.get("Invalid ability")?.add(unit.baseUnit.name);
						} else {
							issueList.set("Invalid ability", new Set([unit.baseUnit.name]));
						}
						issueUnits.add(unit.id!);
					}
				}
				if (this.options.minSkill && unit.skill && this.options.minSkill > unit.skill) {
					if (issueList.has("Minimum skill")) {
						issueList.get("Minimum skill")?.add(unit.baseUnit.name);
					} else {
						issueList.set("Minimum skill", new Set([unit.baseUnit.name]));
					}
					issueUnits.add(unit.id!);
				}
				if (this.options.maxSkill && unit.skill && this.options.maxSkill < unit.skill) {
					if (issueList.has("Maximum skill")) {
						issueList.get("Maximum skill")?.add(unit.baseUnit.name);
					} else {
						issueList.set("Maximum skill", new Set([unit.baseUnit.name]));
					}
					issueUnits.add(unit.id!);
				}
				if (this.options.unitMinPV && unit.cost < this.options.unitMinPV && unit.baseUnit.name != "Off Board Artillery Support - Thumper") {
					if (issueList.has(`Minimum unit pv (${this.options.unitMinPV})`)) {
						issueList.get(`Minimum unit pv (${this.options.unitMinPV})`)?.add(unit.baseUnit.name);
					} else {
						issueList.set(`Minimum unit pv (${this.options.unitMinPV})`, new Set([unit.baseUnit.name]));
					}
					issueUnits.add(unit.id!);
				}
			}
			if (this.options.unitLimits) {
				let groupedUnits = Object.groupBy(this.units, (unit) => unit.baseUnit.subtype);
				for (const limit of this.options.unitLimits) {
					let count = 0;
					for (const type of limit.types) {
						count += groupedUnits[type]?.length ?? 0;
					}
					if (limit.max && count > limit.max) {
						issueList.set(`Maximum ${limit.types.join("/")}`, new Set([`${count}/${limit.max}`]));
						for (const unit of this.units) {
							if (limit.types.includes(unit.baseUnit.subtype)) {
								issueUnits.add(unit.id!);
							}
						}
					}
					if (limit.equal && !limit.equal.includes(count)) {
						issueList.set(`${limit.types.join("/")}`, new Set([`Exactly ${limit.equal.join(" or ")}: Currently ${count}`]));
						for (const unit of this.units) {
							if (limit.types.includes(unit.baseUnit.subtype)) {
								issueUnits.add(unit.id!);
							}
						}
					}
				}
			}

			if (this.options.chassisLimits) {
				for (const limit of this.options.chassisLimits) {
					let filteredUnits = this.units.filter((unit) => {
						return limit.types.includes("All") || limit.types.includes(unit.baseUnit.subtype);
					});
					let chassisList = Object.groupBy(filteredUnits, (unit) => unit.baseUnit.class);
					for (const [chassisKey, chassisValue] of Object.entries(chassisList)) {
						if (chassisValue?.length && limit.max && chassisValue.length > limit.max) {
							if (issueList.has("Maximum chassis")) {
								issueList.get("Maximum chassis")?.add(chassisKey);
							} else {
								issueList.set("Maximum chassis", new Set([chassisKey]));
							}
							for (const unit of this.units) {
								if (unit.baseUnit.class == chassisKey) {
									issueUnits.add(unit.id!);
								}
							}
						}
					}
				}
			}

			if (this.options.variantLimits) {
				for (const limit of this.options.variantLimits) {
					let filteredUnits = this.units.filter((unit) => {
						return limit.types.includes("All") || limit.types.includes(unit.baseUnit.subtype);
					});
					let chassisList = Object.groupBy(filteredUnits, (unit) => unit.baseUnit.class);
					for (const [chassisKey, chassisValue] of Object.entries(chassisList)) {
						let variantList = Object.groupBy(chassisValue!, (unit) => unit.baseUnit.variant);
						for (const [variantKey, variantValue] of Object.entries(variantList)) {
							if (variantValue?.length && limit.max && variantValue.length > limit.max) {
								if (
									!limit.exceptions ||
									!variantValue[0].baseUnit.abilities.find((ability) => {
										return ability.name == "IT" && (ability.v ?? 0) >= 3;
									})
								) {
									if (issueList.has("Maximum variants")) {
										issueList.get("Maximum variants")?.add(chassisKey);
									} else {
										issueList.set("Maximum variants", new Set([chassisKey]));
									}
									for (const unit of this.units) {
										if (unit.baseUnit.class == chassisKey) {
											issueUnits.add(unit.id!);
										}
									}
								}
							}
						}
					}
				}
			}

			if (this.options.skillLimits) {
				for (const limit of this.options.skillLimits) {
					let groupedUnits = this.units.filter((unit) => {
						return limit.types.includes(unit.skill?.toString() ?? "4");
					});
					if (limit.max && groupedUnits.length > limit.max) {
						if (issueList.has(`Maximum skill limits`)) {
							issueList.get(`Maximum skill limits`)?.add(`Skills ${limit.types.join("+")} - ${groupedUnits.length}/${limit.max}`);
						} else {
							issueList.set(`Maximum skill limits`, new Set([`Skills ${limit.types.join("+")} - ${groupedUnits.length}/${limit.max}`]));
						}
						for (const unit of this.units) {
							if (limit.types.includes(unit.skill?.toString() ?? "4")) {
								issueUnits.add(unit.id!);
							}
						}
					}
				}
			}

			if (this.options.requireHitch) {
				const htcUnits = this.units.filter((unit) => {
					return unit.baseUnit.abilities?.find((ability) => ability.name == "HTC");
				});
				let trailers = htcUnits.filter((unit) => {
					if (unit.baseUnit.move) {
						return !unit.baseUnit.move[0].speed;
					}
				});
				let hitches = htcUnits.filter((unit) => {
					if (unit.baseUnit.move) {
						return unit.baseUnit.move[0].speed;
					}
				});
				if (trailers.length > hitches.length) {
					issueList.set("Trailers without HTC ", new Set([`${trailers.length} Trailers / ${hitches.length} Transports`]));
					for (const trailer of trailers) {
						issueUnits.add(trailer.id!);
					}
				}
			}

			if (this.options.abilityLimits) {
				for (const limit of this.options.abilityLimits) {
					for (const limitedAbility of limit.types) {
						const limitedUnits = this.units.filter((unit) => {
							return unit.baseUnit.abilities.find((ability) => limitedAbility == ability.name);
						});
						const count = limitedUnits.reduce((total, unit) => {
							const unitAbility = unit.baseUnit.abilities.find((ability) => limitedAbility == ability.name);
							return (total += (unitAbility?.v ?? 0) + (unitAbility?.vhid ?? 0));
						}, 0);
						if (limit.max && count > limit.max) {
							issueList.set(
								`${limit.types} limit exceeded`,
								new Set(
									limitedUnits.map((unit) => {
										return unit.baseUnit.name;
									})
								)
							);
							for (const unit of limitedUnits) {
								issueUnits.add(unit.id!);
							}
						}
					}
				}
			}
			if (this.options.uniqueMaxLimit) {
				let uniquesInList = this.units.filter((unit) => this.resultList.uniqueList.includes(unit.baseUnit.mulId));
				if (uniquesInList.length > 1) {
					for (const unit of uniquesInList) {
						if (issueList.has("Unique units limit")) {
							issueList.get("Unique units limit")?.add(unit.baseUnit.name);
						} else {
							issueList.set("Unique units limit", new Set([unit.baseUnit.name]));
						}
						issueUnits.add(unit.id!);
					}
				}
			}
		}
		return { issueList, issueUnits, issueMessage };
	});

	setOptions(newRules: string) {
		this.rules = newRules;
	}

	newUnit(baseUnit: MulUnit) {
		let unitId: string = nanoid(6);
		while (
			this.units.find(({ id }) => {
				return id == unitId;
			})
		) {
			unitId = nanoid(6);
		}
		this.units.push({ id: unitId, baseUnit, skill: 4, cost: baseUnit.pv, customization: {} });
		this.formations
			.find((formation) => {
				return formation.id == "unassigned";
			})
			?.units.push({ id: unitId });
	}

	getUnit(idToFind: string) {
		return this.units.find((unit) => {
			return unit.id == idToFind;
		});
	}
	removeUnit(idToRemove: string) {
		this.units = this.units.filter((unit) => {
			return unit.id != idToRemove;
		});
		this.formations.forEach((formation) => {
			formation.units = formation.units.filter((unit) => {
				return unit.id != idToRemove;
			});
		});
		this.sublists.forEach((sublist) => {
			sublist.checked = sublist.checked.filter((unitId) => {
				return unitId != idToRemove;
			});
		});
	}
	newFormation() {
		const id: string = crypto.randomUUID();
		this.formations.push({ id, name: `New formation`, type: "Battle", units: [] });
	}
	getFormation(formationId: string) {
		return this.formations.find(({ id }) => {
			return id == formationId;
		});
	}
	removeFormation(idToRemove: string) {
		let formationToRemove = this.formations.find((formation) => {
			return formation.id == idToRemove;
		});
		if (formationToRemove) {
			formationToRemove.units.forEach((unitId) => {
				this.removeUnit(unitId.id);
			});
		}
		this.formations = this.formations.filter((formation) => {
			return formation.id != idToRemove;
		});
	}
	clear() {
		this.units = [];
		this.formations = [{ id: "unassigned", name: "Unassigned units", type: "none", units: [] }];
		this.sublists = [];
		this.scaList = [];
	}

	addSublist(sublistToAdd?: SublistV2): string {
		const id = crypto.randomUUID();
		this.sublists.push(sublistToAdd ?? { id, checked: [], scenario: "-" });
		return id;
	}

	getSublist(idToFind: string) {
		return this.sublists.find((sublist) => {
			return sublist.id == idToFind;
		});
	}

	copySublist(sublistId: String) {
		const existingSublist = this.sublists.find((sublist) => {
			return sublist.id == sublistId;
		});
		if (existingSublist) {
			const newSublist = structuredClone($state.snapshot(existingSublist));
			newSublist.id = crypto.randomUUID();
			this.sublists.push(newSublist);
		}
	}

	deleteSublist(sublistId: String) {
		this.sublists = this.sublists.filter((sublist) => {
			return sublist.id != sublistId;
		});
	}

	addSCA(idToAdd: number) {
		const sca = getSCAfromId(idToAdd);
		if (sca !== undefined) {
			this.scaList.push(sca);
		}
	}

	removeSCA(indexToRemove: number) {
		this.scaList.splice(indexToRemove, 1);
	}

	getListCode() {
		return this.listCode;
	}
	createTTSCode() {
		let tempUnitArray: string[] = [];
		this.units.forEach((unit) => {
			if (unit.baseUnit.mulId > 0) {
				tempUnitArray.push(`{${unit.baseUnit.mulId},${unit.skill}}`);
			}
			tempUnitArray.push();
		});
		return `{${tempUnitArray.join(",")}}`;
	}
	async loadUnit(mulId: number) {
		let unitToAdd!: MulUnit;

		unitToAdd = await loadMULUnit(mulId.toString());
		unitToAdd.rulesLevel = "Standard";

		return unitToAdd;
	}
	async loadList(data: any) {
		const listCode: ListCode = data;
		this.id = listCode.id;
		this.details.name = listCode.name;
		this.details.eras = listCode.eras;
		this.details.factions = listCode.factions;
		this.rules = listCode.rules;

		this.resultList.eras = this.details.eras;
		this.resultList.factions = this.details.factions;
		this.resultList.setOptions(this.rules);
		this.resultList.loadResults();

		this.clear();
		this.sublists = listCode.sublists;
		const sublistIds = new Set();
		this.sublists.forEach((sublist) => {
			while (sublistIds.has(sublist.id) || sublist.id.length > 6) {
				sublist.id = nanoid(6);
			}
			sublistIds.add(sublist.id);
		});

		for (const unit of listCode.units) {
			while (
				this.units.find((existingUnit) => {
					return unit.id == existingUnit.id;
				})
			) {
				unit.id = nanoid(6);
			}
			let baseUnit: MulUnit =
				this.resultList.resultList.find((result: MulUnit) => {
					return result.mulId == unit.mulId;
				}) ?? (await this.loadUnit(unit.mulId));
			//@ts-ignore
			if (!unit.skill || unit.skill == "undefined") {
				unit.skill = 4;
			}
			const tempUnit = { id: unit.id, baseUnit: baseUnit, skill: unit.skill, cost: getNewSkillCost(unit.skill, baseUnit.pv), customization: unit.customization };
			this.units.push(tempUnit);
		}
		this.formations = listCode.formations;
		const formationIDs = new Set();
		this.formations.forEach((formation) => {
			while (formation.id != "unassigned" && (formationIDs.has(formation.id) || formation.id.length > 6)) {
				formation.id = nanoid(6);
			}
			formationIDs.add(formation.id);
		});
		this.units.forEach((listUnit) => {
			let assigned = false;
			this.formations.forEach((formation) => {
				if (
					formation.units.find((formationUnit) => {
						return listUnit.id == formationUnit.id;
					}) ||
					formation.secondary?.units.find((formationUnit) => {
						return listUnit.id == formationUnit.id;
					})
				) {
					assigned = true;
				}
			});
			if (!assigned) {
				this.formations[0].units.push({ id: listUnit.id });
			}
		});
		//update id's
		for (const unit of this.units) {
			if (unit.id.length > 6) {
				const oldId = unit.id;
				let newId = nanoid(6);
				while (
					this.units.find(({ id }) => {
						return id == newId;
					})
				) {
					newId = nanoid(6);
				}
				for (const formation of this.formations) {
					for (const unit of formation.units) {
						if (unit.id == oldId) {
							unit.id = newId;
						}
					}
					for (const unit of formation.secondary?.units ?? []) {
						if (unit.id == oldId) {
							unit.id = newId;
						}
					}
				}
				for (const sublist of this.sublists) {
					const index = sublist.checked.indexOf(oldId);
					if (index != -1) {
						sublist.checked[index] = newId;
					}
				}
				unit.id = newId;
			}
		}
		if (listCode.scas !== undefined) {
			for (const scaId of listCode.scas) {
				this.addSCA(scaId);
			}
		}
	}
}
