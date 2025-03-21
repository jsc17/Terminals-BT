import type { UnitV2 } from "$lib/types/unit";

export const formationTypes = [
	"Battle",
	"Assault",
	"Striker/Cavalry",
	"Fire",
	"Recon",
	"Pursuit",
	"Command",
	"Support",
	"Transport and Infantry",
	"Air Lance",
	"Interceptor Squadron",
	"Aerospace Superiority Squadron",
	"Fire Support Squadron",
	"Strike Squadron",
	"Electronic Warfare Squadron",
	"Transport Squadron"
];

export type FormationV2 = {
	id: string;
	name: string;
	type: string;
	units: { id: string }[];
};
