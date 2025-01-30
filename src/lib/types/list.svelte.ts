import type { UnitV2, MulUnit } from "./unit";
import { getNewSkillCost } from "$lib/utilities/bt-utils";
import customCards from "$lib/data/customCards.json";
import { deserialize } from "$app/forms";
import { SvelteMap } from "svelte/reactivity";
import type { FormationStyles, FormationV2 } from "./formation";
import type { ListCode, ListCodeUnit } from "./listCode";
import type { SublistV2 } from "./sublist";
import type { ResultList } from "./resultList.svelte";

export class List {
	units = new SvelteMap<string, UnitV2>()
	formations: FormationV2[] = $state([{ id: "unassigned", name: "Unassigned units", type: "none", units: [], style: "unassigned" }]);
	sublists: SublistV2[] = $state([]);

	details = $state({ name: "New List", era: -1, faction: -1, general: -1 });
	rules = $state<string>("noRes");
	id: string = crypto.randomUUID();

	unitCount = $derived(this.units.size)
	pv = $derived(Array.from(this.units.values()).reduce((total, current) => { return total + current.cost }, 0));
	items: any;
	resultList: any;

	setOptions(newRules: string) {
		this.rules = newRules;
	}

	newUnit(baseUnit: MulUnit) {
		const unit: UnitV2 = { baseUnit, skill: 4, cost: baseUnit.pv, customization: {} }
		const unitId: string = crypto.randomUUID()
		this.units.set(unitId, unit);
		this.formations.find((formation) => { return formation.id == "unassigned" })?.units.push({ id: unitId })
	}
	newFormation(style: FormationStyles = "ground") {
		const id: string = crypto.randomUUID()
		this.formations.push({ id, name: `New ${style} formation`, type: style == "ground" ? "battle" : "interceptor", units: [], style })
	}
	removeUnit(id: string) {
		this.units.delete(id);
		this.formations.forEach((formation) => {
			formation.units = formation.units.filter((unit) => {
				return unit.id != id
			})
		})
		this.sublists.forEach((sublist) => {
			sublist.checked = sublist.checked.filter((unitId) => {
				return unitId != id;
			})
		})
	}
	removeFormation(id: string) {
		let formationToRemove = this.formations.find((formation) => { return formation.id == id });
		if (formationToRemove) {
			for (const unit of formationToRemove.units) {
				this.units.delete(unit.id);
			}
		}
		this.formations = this.formations.filter((formation) => {
			return formation.id != id;
		})
	}
	clear() {
		this.units.clear();
		this.formations = [{ id: "unassigned", name: "Unassigned units", type: "none", units: [], style: "unassigned" }];
		this.sublists = [];
	}

	createListCode() {
		let unitList: ListCodeUnit[] = [];
		this.units.forEach((unit, key, map) => {
			unitList.push({ id: key, mulId: unit.baseUnit.mulId, skill: unit.skill, customization: unit.customization })
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
		return JSON.stringify(listCode);
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
				let [moveSpeed, moveType] = movement.split('"');
				tempMovement.push({ speed: parseInt(moveSpeed), type: moveType });
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

			await resultList.loadUnits();

			this.details.general = resultList.general
			this.clear();
			this.formations = listCode.formations;
			this.sublists = listCode.sublists;
			for (const unit of listCode.units) {
				let baseUnit: MulUnit = resultList.resultList.find((result: MulUnit) => {
					return result.mulId == unit.mulId
				}) ?? await this.loadUnit(unit.mulId);
				this.units.set(unit.id, { baseUnit: baseUnit, skill: unit.skill, cost: getNewSkillCost(unit.skill, baseUnit.pv), customization: unit.customization })
			}
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

						this.units.set(unitId, { baseUnit: baseUnit, skill, cost: getNewSkillCost(skill, baseUnit.pv), customization: {} });
						unitList.push({ id: unitId });
					}
					this.formations.push({ id: formationId, style: formationData.style, name: formationData.name, type: formationData.type, units: unitList })

				} else {
					const unitId: string = crypto.randomUUID();
					let [mulId, skill] = item.split(",");
					let baseUnit: MulUnit = resultList.resultList.find((result: MulUnit) => {
						return result.mulId == Number(mulId);
					}) ?? await this.loadUnit(Number(mulId))

					if (skill == "undefined") {
						skill = 4;
					}

					this.units.set(unitId, { baseUnit: baseUnit, skill, cost: getNewSkillCost(skill, baseUnit.pv), customization: {} });
					this.formations.find((formation) => { return formation.id == "unassigned" })?.units.push({ id: unitId });
				}
			}
		}

	}
}
