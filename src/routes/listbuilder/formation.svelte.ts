import { type Unit } from "./unit";

export type Formation = {
	id: number;
	name: string;
	type: string;
	units: Unit[];
	style: "ground" | "air";
};

export const groundFormationTypes = ["Battle", "Assault", "Striker/Cavalry", "Fire", "Recon", "Pursuit", "Command", "Support", "Transport and Infantry", "Air Lance"];
export const airFormationTypes = ["Interceptor", "Aerospace Superiority", "Fire Support", "Strike", "Electronic Warfare", "Transport"];

export function isFormation(item: Unit | Formation): item is Formation {
	return "units" in item;
}

class FormationDrag {
	disabled = $state(false);
	type = $state("all");
}

export let dragType = new FormationDrag();
