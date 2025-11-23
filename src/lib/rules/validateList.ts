import { isAvailable, isUnique } from "$lib/remote/unit.remote";
import type { MulUnit } from "$lib/types/listTypes";
import { getRulesByName } from "$lib/types/rulesets";
import { getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";

export async function validateRules(unitList: { id: string; skill: number; data: MulUnit }[], eras: number[], factions: number[], selectedRules: string) {
	const rulesData = getRulesByName(selectedRules)!;

	const issueList = new Map<string, Set<string>>();
	const issueUnits = new Set<string>();
	let issueMessage = "";

	if (rulesData) {
		let listTotalPv = 0;
		for (const unit of unitList) {
			const cost = getNewSkillCost(unit.skill, unit.data.pv);
			listTotalPv += cost;
			if (rulesData.eraFactionRestriction && unit.data.mulId > 0 && !(await isAvailable({ mulId: unit.data.mulId, eras, factions }))) {
				if (unit.data.mulId < 0) {
					issueMessage = "If a battlefield support unit is showing as unavailable, it might have been added using a different rules selection. Remove and re-add the unit";
				}
				if (issueList.has("Unavailable Unit(s)")) {
					issueList.get("Unavailable Unit(s)")?.add(unit.data.name);
				} else {
					issueList.set("Unavailable Unit(s)", new Set([unit.data.name]));
				}
				issueUnits.add(unit.id!);
			}
			if (rulesData.allowedTypes && !rulesData.allowedTypes.includes(unit.data.subtype)) {
				if (issueList.has("Invalid Type")) {
					issueList.get("Invalid Type")?.add(unit.data.name);
				} else {
					issueList.set("Invalid Type", new Set([unit.data.name]));
				}
				issueUnits.add(unit.id!);
			}
			if (rulesData.allowedRules && !rulesData.allowedRules.includes(unit.data.rulesLevel)) {
				if (issueList.has("Invalid Rules Level")) {
					issueList.get("Invalid Rules Level")?.add(unit.data.name);
				} else {
					issueList.set("Invalid Rules Level", new Set([unit.data.name]));
				}
				issueUnits.add(unit.id!);
			}
			if (rulesData.disallowUnique && (await isUnique({ mulId: unit.data.mulId, era: eras[0] }))) {
				if (issueList.has("Unique Units")) {
					issueList.get("Unique Units")?.add(unit.data.name);
				} else {
					issueList.set("Unique Units", new Set([unit.data.name]));
				}
				issueUnits.add(unit.id!);
			}
			if (rulesData.disallowedAbilities) {
				let prohibittedAbility = false;
				for (const ability of unit.data.abilities) {
					if (rulesData.disallowedAbilities.includes(ability.name)) {
						prohibittedAbility = true;
					}
				}
				if (prohibittedAbility) {
					if (issueList.has("Invalid ability")) {
						issueList.get("Invalid ability")?.add(unit.data.name);
					} else {
						issueList.set("Invalid ability", new Set([unit.data.name]));
					}
					issueUnits.add(unit.id!);
				}
			}
			if (rulesData.minSkill !== undefined && unit.skill !== undefined && rulesData.minSkill > unit.skill) {
				if (issueList.has("Minimum skill")) {
					issueList.get("Minimum skill")?.add(unit.data.name);
				} else {
					issueList.set("Minimum skill", new Set([unit.data.name]));
				}
				issueUnits.add(unit.id!);
			}
			if (rulesData.maxSkill && unit.skill && rulesData.maxSkill < unit.skill) {
				if (issueList.has("Maximum skill")) {
					issueList.get("Maximum skill")?.add(unit.data.name);
				} else {
					issueList.set("Maximum skill", new Set([unit.data.name]));
				}
				issueUnits.add(unit.id!);
			}
			if (rulesData.unitMinPV && cost < rulesData.unitMinPV && unit.data.name != "Off Board Artillery Support - Thumper") {
				if (issueList.has(`Minimum unit pv (${rulesData.unitMinPV})`)) {
					issueList.get(`Minimum unit pv (${rulesData.unitMinPV})`)?.add(unit.data.name);
				} else {
					issueList.set(`Minimum unit pv (${rulesData.unitMinPV})`, new Set([unit.data.name]));
				}
				issueUnits.add(unit.id!);
			}
		}
		if (rulesData.unitLimits) {
			let groupedUnits = Object.groupBy(unitList, (unit) => unit.data.subtype);
			for (const limit of rulesData.unitLimits) {
				let count = 0;
				for (const type of limit.types) {
					count += groupedUnits[type]?.length ?? 0;
				}
				if (limit.max && count > limit.max) {
					issueList.set(`Maximum ${limit.types.join("/")}`, new Set([`${count}/${limit.max}`]));
					for (const unit of unitList) {
						if (limit.types.includes(unit.data.subtype)) {
							issueUnits.add(unit.id!);
						}
					}
				}
				if (limit.equal && !limit.equal.includes(count)) {
					issueList.set(`${limit.types.join("/")}`, new Set([`Exactly ${limit.equal.join(" or ")}: Currently ${count}`]));
					for (const unit of unitList) {
						if (limit.types.includes(unit.data.subtype)) {
							issueUnits.add(unit.id!);
						}
					}
				}
			}
		}
		if (rulesData.chassisLimits) {
			for (const limit of rulesData.chassisLimits) {
				let filteredUnits = unitList.filter((unit) => {
					return limit.types.includes("All") || limit.types.includes(unit.data.subtype);
				});
				let chassisList = Object.groupBy(filteredUnits, (unit) => unit.data.class);
				for (const [chassisKey, chassisValue] of Object.entries(chassisList)) {
					if (chassisValue?.length && limit.max && chassisValue.length > limit.max) {
						if (issueList.has("Maximum chassis")) {
							issueList.get("Maximum chassis")?.add(chassisKey);
						} else {
							issueList.set("Maximum chassis", new Set([chassisKey]));
						}
						for (const unit of unitList) {
							if (unit.data.class == chassisKey) {
								issueUnits.add(unit.id!);
							}
						}
					}
				}
			}
		}
		if (rulesData.variantLimits) {
			for (const limit of rulesData.variantLimits) {
				let filteredUnits = unitList.filter((unit) => {
					return limit.types.includes("All") || limit.types.includes(unit.data.subtype);
				});
				let chassisList = Object.groupBy(filteredUnits, (unit) => unit.data.class);
				for (const [chassisKey, chassisValue] of Object.entries(chassisList)) {
					let variantList = Object.groupBy(chassisValue!, (unit) => unit.data.variant);
					for (const [variantKey, variantValue] of Object.entries(variantList)) {
						if (variantValue?.length && limit.max && variantValue.length > limit.max) {
							if (
								!limit.exceptions ||
								!variantValue[0].data.abilities.find((ability) => {
									return ability.name == "IT" && (ability.v ?? 0) >= 3;
								})
							) {
								if (issueList.has("Maximum variants")) {
									issueList.get("Maximum variants")?.add(chassisKey);
								} else {
									issueList.set("Maximum variants", new Set([chassisKey]));
								}
								for (const unit of unitList) {
									if (unit.data.class == chassisKey) {
										issueUnits.add(unit.id!);
									}
								}
							}
						}
					}
				}
			}
		}
		if (rulesData.skillLimits) {
			for (const limit of rulesData.skillLimits) {
				let groupedUnits = unitList.filter((unit) => {
					return limit.types.includes(unit.skill?.toString() ?? "4");
				});
				if (limit.max && groupedUnits.length > limit.max) {
					if (issueList.has(`Maximum skill limits`)) {
						issueList.get(`Maximum skill limits`)?.add(`Skills ${limit.types.join("+")} - ${groupedUnits.length}/${limit.max}`);
					} else {
						issueList.set(`Maximum skill limits`, new Set([`Skills ${limit.types.join("+")} - ${groupedUnits.length}/${limit.max}`]));
					}
					for (const unit of unitList) {
						if (limit.types.includes(unit.skill?.toString() ?? "4")) {
							issueUnits.add(unit.id!);
						}
					}
				}
			}
		}
		if (rulesData.requireHitch) {
			const htcUnits = unitList.filter((unit) => {
				return unit.data.abilities?.find((ability) => ability.name == "HTC");
			});
			let trailers = htcUnits.filter((unit) => {
				if (unit.data.move) {
					return !unit.data.move[0].speed;
				}
			});
			let hitches = htcUnits.filter((unit) => {
				if (unit.data.move) {
					return unit.data.move[0].speed;
				}
			});
			if (trailers.length > hitches.length) {
				issueList.set("Trailers without HTC ", new Set([`${trailers.length} Trailers / ${hitches.length} Transports`]));
				for (const trailer of trailers) {
					issueUnits.add(trailer.id!);
				}
			}
		}
		if (rulesData.abilityLimits) {
			for (const limit of rulesData.abilityLimits) {
				for (const limitedAbility of limit.types) {
					const limitedUnits = unitList.filter((unit) => {
						return unit.data.abilities.find((ability) => limitedAbility == ability.name);
					});
					const count = limitedUnits.reduce((total, unit) => {
						const unitAbility = unit.data.abilities.find((ability) => limitedAbility == ability.name);
						return (total += (unitAbility?.v ?? 0) + (unitAbility?.vhid ?? 0));
					}, 0);
					if (limit.max && count > limit.max) {
						issueList.set(
							`${limit.types} limit exceeded`,
							new Set(
								limitedUnits.map((unit) => {
									return unit.data.name;
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
		if (rulesData.uniqueMaxLimit) {
			const uniquesInList: { id: string; skill: number; data: MulUnit }[] = [];
			for (const unit of unitList) {
				if (await isUnique({ mulId: unit.data.mulId, era: eras[0] })) {
					uniquesInList.push(unit);
				}
			}
			if (uniquesInList.length > 1) {
				for (const unit of uniquesInList) {
					if (issueList.has("Unique Unit limit")) {
						issueList.get("Unique Unit limit")?.add(unit.data.name);
					} else {
						issueList.set("Unique Unit limit", new Set([unit.data.name]));
					}
					issueUnits.add(unit.id!);
				}
			}
		}
		if (rulesData.maxPv && listTotalPv > rulesData.maxPv) {
			issueList.set("Max PV", new Set([`${listTotalPv}/${rulesData.maxPv}`]));
		}

		if (rulesData.maxUnits && unitList.filter((u) => u.data.mulId >= 0).length > rulesData.maxUnits) {
			issueList.set("Max unitList", new Set([`${unitList.length}/${rulesData.maxUnits}`]));
		}
		const nonGeneralfactionList = factions.filter((faction) => {
			const generalLists = [-1, 55, 56, 57, 85, 90];
			return generalLists.includes(faction);
		});
		if (rulesData.singleEraFaction && (eras.length != 1 || nonGeneralfactionList.length != 1 || factions.length > 2)) {
			issueList.set("Era/Faction", new Set(["Must select a single era and faction"]));
		}
	}
	return { issueList, issueUnits, issueMessage };
}
