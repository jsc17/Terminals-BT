import { getNewSkillCost } from "$lib/utilities/bt-utils";
import type { ValidationList } from "$lib/types/ValidationList";
import { Errors } from "$lib/types/ValidationList";
import type { Unit } from "$lib/types/unit.js";

function createList() {
	let units = $state<Unit[]>([]);
	let details = $state({ name: "", era: "", faction: "", general: "" });
	let valid = $state<ValidationList>({
		pv: [true, 0],
		unitsUnavailable: [true, []],
		unitNumber: [true, 0],
		mechNumber: [true, 0],
		cvNumber: [true, 0],
		infNumber: [true, 0],
		proto: [true, 0],
		unallowedType: [true, []],
		dro: [true, []],
		experimental: [true, []],
		unknown: [true, []],
		unique: [true, []],
		trailer: [true, [], []],
		skillThreshold: [true, []],
		skillCombo: [true, [], 0],
		chassis: [true, []],
		variant: [true, []],
		jmps: [true, [], 0]
	});
	let issue = $state(false);
	let invalidUnits = $state<string[]>([]);
	let errorList = $state<string[]>([]);
	let sublists = $state<string[]>([]);
	let sublist = true;
	let validate = true;

	function validateList() {
		valid.unitNumber[0] = valid.unitNumber[1] <= 16;
		valid.mechNumber[0] = valid.mechNumber[1] <= 12;
		valid.infNumber[0] = valid.infNumber[1] <= 5;
		valid.proto[0] = valid.proto[1] == 0 || valid.proto[1] == 5;
		valid.cvNumber[0] = valid.cvNumber[1] <= 8;
		valid.chassis[0] = valid.chassis[1].length == 0;
		valid.variant[0] = valid.variant[1].length == 0;
		valid.jmps[0] = valid.jmps[2] <= 2;
		valid.trailer[0] = valid.trailer[1].length <= valid.trailer[2].length;

		valid.skillCombo[0] = true;
		valid.skillCombo[1] = [];
		valid.skillCombo[2] = 0;
		valid.pv[1] = 0;

		units.forEach((unit) => {
			if (unit.skill == 6 || unit.skill == 2) {
				valid.skillCombo[2]++;
				valid.skillCombo[1].push(unit.name);
			}
			valid.pv[1] += unit.cost;
		});

		valid.pv[0] = valid.pv[1] <= 350;
		valid.skillCombo[0] = valid.skillCombo[2] <= 2;

		errorList = [];
		invalidUnits = [];
		issue = false;

		Object.entries(valid).forEach(([key, value]) => {
			if (!value[0]) {
				errorList.push(Errors[key]);
				issue = true;
				if (value[1] instanceof Array) {
					invalidUnits = invalidUnits.concat(value[1]);
				}
			}
		});
	}

	return {
		get units() {
			return units;
		},
		get valid() {
			return valid;
		},
		get invalidUnits() {
			return invalidUnits;
		},
		get issue() {
			return issue;
		},
		get errorList() {
			return errorList;
		},
		get sublists() {
			return sublists;
		},
		get sublist() {
			return sublist;
		},
		get validate() {
			return validate;
		},
		set sublists(newSublists) {
			sublists = newSublists;
		},
		details,
		add: (unit: Unit) => {
			units.push(JSON.parse(JSON.stringify(unit)));

			valid.unitNumber[1] += 1;
			switch (unit.type) {
				case "BM":
				case "IM":
					valid.mechNumber[1]++;
					let duplicate = units.filter((u) => {
						return unit.name == u.name;
					});
					if (duplicate.length >= 2) {
						valid.variant[1].push(unit.name);
					}
					break;
				case "CI":
				case "BA":
					valid.infNumber[1]++;
					break;
				case "PM":
					valid.proto[1]++;
					break;
				case "CV":
					valid.cvNumber[1]++;
					break;
			}
			let jmps = unit.abilities.match(/JMPS[1-9]/g);
			if (jmps != null) {
				valid.jmps[2] += parseInt(jmps[0].charAt(4));
				valid.jmps[1].push(unit.name);
			}
			if (unit.abilities.includes("HTC")) {
				if (unit.move![0].speed == 0) {
					valid.trailer[1].push(unit.name);
				} else {
					valid.trailer[2].push(unit.name);
				}
			}
			let duplicate = units.filter((u) => {
				return unit.class == u.class;
			});
			if (duplicate.length > 2) {
				valid.chassis[1].push(unit.class);
			}
			validateList();
		},
		remove: (index: number) => {
			const removed = units.splice(index, 1)[0];

			valid.unitNumber[1]--;
			switch (removed.type) {
				case "BM":
				case "IM":
					valid.mechNumber[1]--;
					let duplicate = units.filter((u) => {
						return removed.name == u.name;
					});
					if (duplicate.length <= 2) {
						valid.variant[1] = valid.variant[1].filter((variant) => {
							return variant != removed.name;
						});
					}
					break;
				case "CI":
				case "BA":
					valid.infNumber[1]--;
					break;
				case "PM":
					valid.proto[1]--;
					break;
				case "CV":
					valid.cvNumber[1]--;
					break;
			}
			let jmps = removed.abilities.match(/JMPS[1-9]/g);
			if (jmps != null) {
				valid.jmps[2] -= parseInt(jmps[0].charAt(4));
				valid.jmps[1].splice(valid.jmps[1].indexOf(removed.name), 1);
			}
			if (removed.abilities.includes("HTC")) {
				if (removed.move![0].speed == 0) {
					valid.trailer[1].splice(valid.trailer[1].indexOf(removed.name), 1);
				} else {
					index;
					valid.trailer[2].splice(valid.trailer[2].indexOf(removed.name), 1);
				}
			}
			let duplicate = units.filter((u) => {
				return removed.class == u.class;
			});
			if (duplicate.length <= 2) {
				valid.chassis[1] = valid.chassis[1].filter((chassis) => {
					return chassis != removed.class;
				});
			}
			validateList();
		},
		modifySkill: (index: number, newSkill: number, basePV: number) => {
			let newCost = getNewSkillCost(newSkill, basePV);

			units[index].skill = newSkill;
			units[index].cost = newCost;
			validateList();
		},
		moveUnit: (index: number, newIndex: number) => {
			if (newIndex >= 0 && newIndex < units.length) {
				let temp = units[newIndex];
				units[newIndex] = units[index];
				units[index] = temp;
			}
		}
	};
}

export const list = createList();
