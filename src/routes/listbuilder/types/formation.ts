import { formationReferences } from "$lib/data";

export type FormationV2 = {
	id: string;
	name: string;
	type: string;
	units: { id: string }[];
	secondary?: { type: string; units: { id: string }[] };
};

export type FormationType = {
	name: string;
	bonus: string;
	page: string;
	variations?: FormationType[];
	referencedSPAs?: string[];
	grantedSCAs?: string[];
	ideal?: string;
	requirements?: string[];
	secondary?: boolean;
};

export function getFormationTypeByName(name: string) {
	let formationReference: FormationType | undefined;

	for (const { formations } of formationReferences as { type: string; formations: FormationType[] }[]) {
		for (const reference of formations) {
			if (reference.name == name) {
				formationReference = reference;
			} else if (reference.variations) {
				for (const variation of reference.variations) {
					if (variation.name == name) {
						formationReference = variation;
					}
				}
			}
		}
		if (formationReference) {
			break;
		}
	}
	return formationReference;
}
