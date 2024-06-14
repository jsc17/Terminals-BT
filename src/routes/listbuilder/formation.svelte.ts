import { type Unit } from "./unit";

export type Formation = {
	id: number;
	name: string;
	type: string;
	units: Unit[];
};

export const formationTypes = ["Battle", "Assault", "Striker/Cavalry", "Fire", "Recon", "Pursuit", "Command", "Support"];

export function isFormation(item: Unit | Formation): item is Formation {
	return "units" in item;
}

class FormationDrag {
	enabled = $state(true);
}

export let formationDragStatus = new FormationDrag();
