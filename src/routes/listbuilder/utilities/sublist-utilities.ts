import { toastController } from "$lib/stores";
import { type ListFormation, type List, type Sublist } from "$lib/types/list.svelte";
import { sendListToPlay } from "$lib/playmode/playmode";
import { nanoid } from "nanoid";

export function loadSublistForPlay(sublist: Sublist, list: List) {
	if (sublist.checked.length) {
		const units = sublist.checked
			.map((unitId) => {
				return { id: list.getUnit(unitId)?.id ?? "" };
			})
			.filter((unit) => unit.id != "");
		const sublistFormation: ListFormation = {
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
