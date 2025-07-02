import { List, type ListFormation } from "$lib/types/list.svelte";

export function validateFormation(formation: ListFormation, list: List) {
	let results: { valid: boolean; issues: string[] } = { valid: true, issues: [] };
	if (formation.units.length < 3) {
		results.valid = false;
		results.issues.push("Minimum number of units is 3");
	}

	return results;
}
