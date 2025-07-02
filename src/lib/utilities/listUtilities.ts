import { scaReferences } from "$lib/data";
import type { SCA } from "$lib/types/listTypes";

export function getSCAfromId(id: number): SCA | undefined {
	return scaReferences.find((sca) => {
		return sca.id == id;
	});
}

export function getSCAfromName(name: string): SCA | undefined {
	return scaReferences.find((sca) => {
		return sca.name == name;
	});
}
