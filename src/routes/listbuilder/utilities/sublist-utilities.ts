import { toastController } from "$lib/stores";
import { sendListToPlay, type FormationV2, type List, type SublistV2 } from "$lib/types";
import { nanoid } from "nanoid";

export function loadSublistForPlay(sublist: SublistV2, list: List) {
	if (sublist.checked.length) {
		const units = sublist.checked
			.map((unitId) => {
				return { id: list.getUnit(unitId)?.id ?? "" };
			})
			.filter((unit) => unit.id != "");
		const sublistFormation: FormationV2 = {
			id: nanoid(6),
			name: `${list.details.name}${sublist.scenario != "-" ? ` ${sublist.scenario} ` : " "}Sublist`,
			type: "none",
			units
		};
		sendListToPlay([sublistFormation], list.units);
	} else {
		toastController.addToast("Cannot play an empty sublist");
	}
}
