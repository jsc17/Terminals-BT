import type { UnitV2, MulUnit } from "$lib/types/unit";
import { getNewSkillCost } from "$lib/utilities/bt-utils";
import customCards from "$lib/data/customCards.json";
import { deserialize } from "$app/forms";
import type { FormationV2 } from "./formation";
import type { ListCode, ListCodeUnit } from "./listCode";
import type { SublistV2 } from "./sublist";
import type { ResultList } from "$lib/types/resultList.svelte";
import { getRules } from "$lib/types/options";
import { convertUnversionedJSONList } from "../utilities/convert";

export class List {
	units: UnitV2[] = $state([]);
	formations: FormationV2[] = $state([{ id: "unassigned", name: "Unassigned units", type: "none", units: [] }]);
	sublists: SublistV2[] = $state([]);

	details: { name: string; eras: number[]; factions: number[]; general: number } = $state({ name: "New List", eras: [], factions: [], general: -1 });
	rules = $state<string>("noRes");
	id: string = $state(crypto.randomUUID());

	unitCount = $derived(this.units.length);
	pv = $derived(
		Array.from(this.units.values()).reduce((total, current) => {
			return total + current.cost;
		}, 0)
	);

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
		if (this.unitCount != 0 || localStorage.getItem("last-list") === null) {
			localStorage.setItem("last-list", JSON.stringify(newListCode));
		}

		return JSON.stringify(newListCode);
	});

	issues = $derived.by(() => {
		const issueList = new Map<string, Set<string>>();
		const issueUnits = new Set<string>();

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
					for (const ability of unit.baseUnit.abilities.replaceAll(" ", "").split(",")) {
						if (this.options.disallowedAbilities.includes(ability)) {
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
					return unit.baseUnit.abilities.includes("HTC");
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
					const abilityExp = new RegExp(`${limit.types}[0-9]`, "g");
					const limitedUnits = this.units.filter((unit) => {
						return unit.baseUnit.abilities.match(abilityExp);
					});
					const abilityCounts = limitedUnits.map((unit) => unit.baseUnit.abilities.match(abilityExp)?.toString());

					let count = abilityCounts.reduce((accumulator, value) => {
						return accumulator + Number(value?.at(-1));
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
		return { issueList, issueUnits };
	});

	setOptions(newRules: string) {
		this.rules = newRules;
	}

	newUnit(baseUnit: MulUnit) {
		const unitId: string = crypto.randomUUID();
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

	newFormation() {
		const id: string = crypto.randomUUID();
		this.formations.push({ id, name: `New formation`, type: "battle", units: [] });
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

		if (mulId < 0) {
			for (const unitList of customCards.unitPacks) {
				for (const unit of unitList.units) {
					if (unit.id == mulId) {
						unitToAdd = {
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
						};
					}
				}
			}
		} else {
			let response: any = deserialize(await (await fetch("/?/getUnit", { method: "POST", body: JSON.stringify({ mulId }) })).text());
			let tempMovement: { speed: number; type: string }[] = [];
			response.data!.unit.move.split("/").forEach((movement: string) => {
				let moveSpeed = movement.replaceAll('"', "").match(/\d+/) ?? "0";
				let moveType = movement.replaceAll('"', "").match(/\D+/) ?? "";
				tempMovement.push({ speed: parseInt(moveSpeed[0]), type: moveType[0] });
			});
			const unitData = response.data!.unit;
			unitToAdd = {
				mulId: unitData.mulId,
				name: unitData.name,
				class: unitData.class,
				variant: unitData.variant,
				type: unitData.type,
				subtype: unitData.subtype.toUpperCase(),
				pv: unitData.pv,
				cost: unitData.pv,
				skill: 4,
				size: unitData.size,
				move: tempMovement,
				tmm: unitData.tmm,
				health: unitData.armor + unitData.structure,
				armor: unitData.armor,
				structure: unitData.structure,
				damageS: unitData.damage_s,
				damageSMin: unitData.damage_s_min,
				damageM: unitData.damage_m,
				damageMMin: unitData.damage_m_min,
				damageL: unitData.damage_l,
				damageLMin: unitData.damage_l_min,
				damageE: unitData.damage_e,
				damageEMin: unitData.damage_e_min,
				overheat: unitData.overheat,
				abilities: (unitData.abilities ?? "-").replaceAll(",", ", "),
				imageLink: unitData.image_url,
				rulesLevel: unitData.rules,
				tonnage: unitData.tonnage,
				date: unitData.date_introduced,
				role: unitData.role,
				availability: unitData.availability
			};
		}
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
		this.sublists.forEach(sublist =>{
			 if(sublistIds.has(sublist.id)){
				sublist.id = crypto.randomUUID();
			 }
			 sublistIds.add(sublist.id);
		})

		for (const unit of listCode.units) {
			if(this.units.find(existingUnit=>{return unit.id == existingUnit.id})){
				unit.id = crypto.randomUUID();
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
		this.formations.forEach(formation =>{
			 if(formationIDs.has(formation.id)){
				formation.id = crypto.randomUUID();
			 }
			 formationIDs.add(formation.id);
		})
		this.units.forEach((listUnit) => {
			let assigned = false;
			this.formations.forEach((formation) => {
				if (
					formation.units.find((formationUnit) => {
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
	}
}
