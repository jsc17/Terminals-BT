import { scaReferences } from "$lib/data";

export type SCA = {
	id: number;
	name: string;
	page: string;
};

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
