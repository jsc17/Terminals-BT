import type { UnitV2, MulUnit } from "$lib/types/unit";
import { getNewSkillCost } from "$lib/utilities/bt-utils";
import customCards from "$lib/data/customCards.json";
import { deserialize } from "$app/forms";
import type { FormationStyles, FormationV2 } from "$lib/types/formation";
import type { ListCode, ListCodeUnit } from "./listCode";
import type { SublistV2 } from "./sublist";
import type { ResultList } from "$lib/types/resultList.svelte";
import { getRules } from "$lib/types/options";

export class List {
	units: UnitV2[] = $state([]);
	formations: FormationV2[] = $state([{ id: "unassigned", name: "Unassigned units", type: "none", units: [], style: "unassigned" }]);
	sublists: SublistV2[] = $state([]);

	details = $state({ name: "New List", era: 0, faction: 0, general: -1 });
	rules = $state<string>("noRes");
	id: string = $state(crypto.randomUUID());

	unitCount = $derived(this.units.length);
	pv = $derived(Array.from(this.units.values()).reduce((total, current) => { return total + current.cost }, 0));

	resultList: ResultList;

	constructor(resultList: ResultList) {
		this.resultList = resultList;
	}

	options = $derived(getRules(this.rules));

	listCode = $derived.by(() => {
		let unitList: ListCodeUnit[] = [];
		this.units.forEach((unit) => {
			unitList.push({ id: unit.id, mulId: unit.baseUnit.mulId, skill: unit.skill, customization: unit.customization })
		})

		const listCode: ListCode = {
			id: this.id,
			lcVersion: 1,
			name: this.details.name,
			era: this.details.era,
			faction: this.details.faction,
			rules: this.rules,
			units: unitList,
			formations: this.formations,
			sublists: this.sublists
		}
		localStorage.setItem("last-list", JSON.stringify(listCode));

		return JSON.stringify(listCode);
	})

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
			if (this.options.eraFactionRestriction && (this.details.era == 0 || this.details.faction == 0)) {
				issueList.set("Era/Faction", new Set(["Must select era and faction"]));
			}
			for (const unit of this.units) {
				if (
					this.options.eraFactionRestriction &&
					!this.resultList.availableList.find((result) => {
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
				if (this.options.minSkill && unit.skill !== undefined && this.options.minSkill > unit.skill) {
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
		const unitId: string = crypto.randomUUID()
		this.units.push({ id: unitId, baseUnit, skill: 4, cost: baseUnit.pv, customization: {} });
		this.formations.find((formation) => { return formation.id == "unassigned" })?.units.push({ id: unitId })
	}

	getUnit(idToFind: string) {
		return this.units.find((unit) => { return unit.id == idToFind })
	}

	newFormation(style: FormationStyles = "ground") {
		const id: string = crypto.randomUUID()
		this.formations.push({ id, name: `New ${style} formation`, type: style == "ground" ? "battle" : "interceptor", units: [], style })
	}
	removeUnit(idToRemove: string) {
		this.units = this.units.filter((unit) => { return unit.id != idToRemove })
		this.formations.forEach((formation) => {
			formation.units = formation.units.filter((unit) => {
				return unit.id != idToRemove
			})
		})
		this.sublists.forEach((sublist) => {
			sublist.checked = sublist.checked.filter((unitId) => {
				return unitId != idToRemove;
			})
		})
	}
	removeFormation(idToRemove: string) {
		let formationToRemove = this.formations.find((formation) => { return formation.id == idToRemove });
		if (formationToRemove) {
			formationToRemove.units.forEach((unitId) => { this.units.filter((unit) => { return unit.id == unitId.id }) })
		}
		this.formations = this.formations.filter((formation) => {
			return formation.id != idToRemove;
		})
	}
	clear() {
		this.units = [];
		this.formations = [{ id: "unassigned", name: "Unassigned units", type: "none", units: [], style: "unassigned" }];
		this.sublists = [];
	}

	addSublist() {
		this.sublists.push({ id: crypto.randomUUID(), checked: [], scenario: "-" })
	}

	copySublist(sublistId: String) {
		const existingSublist = this.sublists.find((sublist) => { return sublist.id == sublistId });
		if (existingSublist) {
			const newSublist = structuredClone($state.snapshot(existingSublist));
			newSublist.id = crypto.randomUUID();
			this.sublists.push(newSublist);
		}
	}

	deleteSublist(sublistId: String) {
		this.sublists = this.sublists.filter((sublist) => { return sublist.id != sublistId })
	}

	createListCode() {
		return this.listCode;
	}
	createTTSCode() {
		let tempUnitArray: string[] = [];
		this.units.forEach((unit) => {
			if (unit.baseUnit.mulId > 0) {
				tempUnitArray.push(`{${unit.baseUnit.mulId},${unit.skill}}`);
			}
			tempUnitArray.push()
		})
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
				let moveSpeed = movement.replaceAll('"', '').match(/\d+/) ?? "0";
				let moveType = movement.replaceAll('"', '').match(/\D+/) ?? "";
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
	async loadList(data: any, resultList: ResultList) {
		console.log("Loading List");
		if (data.lcVersion == 1) {
			const listCode: ListCode = data;
			this.id = listCode.id;
			this.details.name = listCode.name;
			this.details.era = listCode.era;
			this.details.faction = listCode.faction;
			this.rules = listCode.rules;

			resultList.details.era = this.details.era;
			resultList.details.faction = this.details.faction;
			resultList.setOptions(this.rules);

			this.details.general = resultList.general
			this.clear();
			this.sublists = listCode.sublists;
			for (const unit of listCode.units) {
				let baseUnit: MulUnit = resultList.resultList.find((result: MulUnit) => {
					return result.mulId == unit.mulId
				}) ?? await this.loadUnit(unit.mulId);
				this.units.push({ id: unit.id, baseUnit: baseUnit, skill: unit.skill, cost: getNewSkillCost(unit.skill, baseUnit.pv), customization: unit.customization })
			}
			this.formations = listCode.formations;

		} else {
			const { era, faction, name, units, sublists, rules } = data;
			this.setOptions(rules);
			resultList.setOptions(rules);

			resultList.details.era = era;
			resultList.details.faction = faction;

			await resultList.loadUnits();

			this.details.name = name;
			this.details.era = era;
			this.details.faction = faction;
			this.details.general = resultList.general;
			this.clear();

			for (const item of units) {
				if (item.charAt(0) == "{") {
					const formationData = JSON.parse(item);
					const formationId: string = crypto.randomUUID();
					let unitList: { id: string }[] = [];

					for (const unit of formationData.units) {
						const unitId: string = crypto.randomUUID();
						let [mulId, skill] = unit.split(",");
						let baseUnit: MulUnit = resultList.resultList.find((result: MulUnit) => {
							return result.mulId == Number(mulId);
						}) ?? await this.loadUnit(Number(mulId))

						if (skill == "undefined") {
							skill = 4;
						}

						this.units.push({ id: unitId, baseUnit: baseUnit, skill, cost: getNewSkillCost(skill, baseUnit.pv), customization: {} });
						unitList.push({ id: unitId });
					}
					this.formations.push({ id: formationId, style: formationData.style, name: formationData.name, type: formationData.type, units: unitList })

				}
			}
		}

	}
}
