import type { MulUnit } from "$lib/types/listTypes";

export const aeroTypes = ["AF", "CF"];
export const vTypes = ["CV", "SV"];
export const mechTypes = ["BM", "IM"];
export const infTypes = ["CI", "BA"];

export function typeIncludes(typesToCheck: string[], reference?: MulUnit) {
	if (!reference) {
		return false;
	}
	return typesToCheck.includes(reference.subtype);
}
