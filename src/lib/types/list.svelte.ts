import type { ListUnit, MulUnit, ListCode, ListCodeUnit, SCA, ListFormation, Sublist, SublistStats } from "$lib/types/listTypes";
import { getSCAfromId, calculateListStats } from "$lib/utilities/listUtilities";
import { getGeneralList, getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";
import { getRulesByName } from "$lib/types/rulesets";
import { nanoid } from "nanoid";
import { getCustomUnitData, getMULDataFromId, getUnitAvailability } from "$lib/remote/unit.remote";
import { db } from "$lib/offline/db";
import { validateRules } from "$lib/rules/validateList";

export type { ListCode, ListCodeUnit, ListUnit, ListFormation, SCA, MulUnit, Sublist, SublistStats };

export class List {
	units: ListUnit[] = $state([]);
	formations = $state<ListFormation[]>([{ id: "unassigned", name: "Unassigned units", type: "none", units: [] }]);
	sublists: Sublist[] = $state([]);
	scaList: SCA[] = $state([]);
	bsList = $state<number[]>([]);

	details: { name: string; eras: number[]; factions: number[]; general: number } = $state({ name: "New List", eras: [], factions: [], general: -1 });
	rules = $state<string>("noRes");
	options = $derived(getRulesByName(this.rules));
	id: string = $state(crypto.randomUUID());

	unitCount = $derived(this.units.filter((u) => u.baseUnit.mulId >= 0).length);
	pv = $derived(
		Array.from(this.units.values()).reduce((total, current) => {
			return total + current.cost;
		}, 0)
	);

	stats = $derived(calculateListStats(this.units));

	unitAvailability = $derived(getUnitAvailability(this.units.map((u) => u.baseUnit.mulId)));

	listCode = $derived.by(() => {
		let unitList: ListCodeUnit[] = [];
		this.units.forEach((unit) => {
			unitList.push({
				id: unit.id,
				mulId: unit.baseUnit.mulId,
				skill: unit.skill,
				customization: Object.keys(unit.customization ?? {}).length == 0 ? undefined : unit.customization
			});
		});

		const newListCode: ListCode = {
			id: this.id,
			lcVersion: 2,
			name: $state.snapshot(this.details.name),
			eras: $state.snapshot(this.details.eras),
			factions: $state.snapshot(this.details.factions),
			rules: $state.snapshot(this.rules),
			units: unitList,
			formations: $state.snapshot(this.formations),
			sublists: $state.snapshot(this.sublists),
			bs: $state.snapshot(this.bsList)
		};
		if (this.scaList.length) {
			newListCode.scas = this.scaList.map(({ id }) => {
				return id;
			});
		}
		return newListCode;
	});

	issues = $derived(
		validateRules(
			$state.snapshot(this.units.map((u) => ({ id: u.id, skill: u.skill ?? 4, data: u.baseUnit }))),
			$state.snapshot(this.details.eras),
			$state.snapshot(this.details.factions.concat(this.details.general == -1 ? [] : [this.details.general])),
			$state.snapshot(this.rules)
		)
	);

	setOptions(newRules: string) {
		this.rules = newRules;
	}

	addUnit(baseUnit: MulUnit) {
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
			if (formation.secondary) {
				formation.secondary.units = formation.secondary.units.filter((unit) => {
					return unit.id != idToRemove;
				});
			}
		});
		this.sublists.forEach((sublist) => {
			sublist.checked = sublist.checked.filter((unitId) => {
				return unitId != idToRemove;
			});
		});
	}
	addFormation() {
		const id: string = crypto.randomUUID();
		this.formations.push({ id, name: `New formation`, type: "Combat Group", units: [] });
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
		this.bsList = [];
	}

	addSublist(sublistToAdd?: Sublist): string {
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

	addBS(id: number) {
		this.bsList.push(id);
	}
	removeBS(indexToRemove: number) {
		this.bsList.splice(indexToRemove, 1);
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
	async loadList(data: ListCode) {
		const listCode: ListCode = data;

		db.previousLists.delete(this.id);
		this.id = listCode.id;
		this.details.name = listCode.name;
		this.details.eras = listCode.eras;
		this.details.factions = listCode.factions;
		if (this.details.eras.length == 1 && this.details.factions.length == 1) this.details.general = getGeneralList(this.details.eras[0], this.details.factions[0]);
		this.rules = listCode.rules;

		this.clear();
		this.sublists = listCode.sublists;
		const sublistIds = new Set();
		this.sublists.forEach((sublist) => {
			while (sublistIds.has(sublist.id) || sublist.id.length > 6) {
				sublist.id = nanoid(6);
			}
			sublistIds.add(sublist.id);
		});

		const unitPromises = (
			await Promise.allSettled(
				listCode.units.map((u) => {
					if (u.mulId >= 0) {
						return getMULDataFromId(u.mulId);
					} else {
						return getCustomUnitData(u.mulId);
					}
				})
			)
		)
			.map((p) => {
				if (p.status == "fulfilled" && p.value) {
					return { mulId: p.value.mulId, data: p.value };
				}
			})
			.filter((p) => p != undefined);

		const unitData = new Map(unitPromises.map((p) => [p.mulId, p.data]));

		for (const unit of listCode.units) {
			while (
				this.units.find((existingUnit) => {
					return unit.id == existingUnit.id;
				})
			) {
				unit.id = nanoid(6);
			}
			let baseUnit: MulUnit | undefined = unitData.get(unit.mulId);
			if (!baseUnit) continue;

			//@ts-ignore
			if (unit.skill === undefined || unit.skill == "undefined") {
				unit.skill = 4;
			}
			if (unit.customization && Object.keys(unit.customization).length == 0) {
				unit.customization = undefined;
			}
			const tempUnit = { id: unit.id, baseUnit: baseUnit, skill: unit.skill, cost: getNewSkillCost(unit.skill, baseUnit.pv), customization: unit.customization };
			this.units.push(tempUnit);
		}
		this.formations = listCode.formations;
		const formationIDs = new Set();
		this.formations.forEach((formation) => {
			let existingIds = new Set<string>();
			let tempUnits = [];
			formation.units = formation.units.filter((u) => !u.id.includes("id:dnd-shadow-placeholder"));

			for (let tempUnit of formation.units) {
				if (existingIds.has(tempUnit.id)) continue;
				tempUnit = { id: tempUnit.id, bonus: tempUnit.bonus };
				tempUnits.push(tempUnit);
				existingIds.add(tempUnit.id);
			}
			formation.units = tempUnits;
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
		if (listCode.bs) {
			this.bsList = listCode.bs;
		}
	}
}
