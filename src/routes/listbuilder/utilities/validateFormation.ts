import type { FormationV2 } from "../types/formation";
import type { List } from "../types/list.svelte";

export function validateFormation(formation: FormationV2, list: List) {
	let results: { valid: boolean; issues: string[] } = { valid: true, issues: [] };
	if (formation.units.length < 3) {
		results.valid = false;
		results.issues.push("Minimum number of units is 3");
	}

	return results;
}
