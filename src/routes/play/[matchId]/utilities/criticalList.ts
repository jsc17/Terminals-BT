const mechCrits = [
	{ id: 0, range: "2", label: "Ammo Hit", value: "destroyed" },
	{ id: 1, range: "3", label: "Engine", value: "engine" },
	{ id: 2, range: "4", label: "Fire Control", value: "firecontrol" },
	{ id: 3, range: "5", label: "No Critical", value: "none" },
	{ id: 4, range: "6", label: "Weapon", value: "weapon" },
	{ id: 5, range: "7", label: "MP", value: "mp" },
	{ id: 6, range: "8", label: "Weapon", value: "weapon" },
	{ id: 7, range: "9", label: "No Critical", value: "none" },
	{ id: 8, range: "10", label: "Fire Control", value: "firecontrol" },
	{ id: 9, range: "11", label: "Engine", value: "engine" },
	{ id: 10, range: "12", label: "Unit Destroyed", value: "destroyed" }
];

const vehicleCrits = [
	{ id: 0, range: "2", label: "Ammo Hit", value: "destroyed" },
	{ id: 1, range: "3", label: "Crew Stunned", value: "crewstunned" },
	{ id: 2, range: "4-5", label: "Fire Control", value: "firecontrol" },
	{ id: 3, range: "6-8", label: "No Critical", value: "none" },
	{ id: 4, range: "7", label: "MP", value: "mp" },
	{ id: 5, range: "9-10", label: "Weapon", value: "weapon" },
	{ id: 6, range: "11", label: "Crew Killed", value: "destroyed" },
	{ id: 7, range: "12", label: "Engine", value: "engine" }
];
const motive = [
	{ id: 8, range: "2-8", label: "No Effect", value: "none" },
	{ id: 9, range: "9-10", label: "-2 MV, -1 TMM", value: "mhit" },
	{ id: 10, range: "11", label: "1/2 MV, 1/2 TMM", value: "mhalf" },
	{ id: 11, range: "12", label: "Unit Immobilized", value: "mimm" }
];
const protoCrits = [
	{ id: 0, range: "2-3", label: "Weapon", value: "weapon" },
	{ id: 1, range: "4", label: "Fire Control", value: "firecontrol" },
	{ id: 2, range: "5", label: "MP", value: "mp" },
	{ id: 3, range: "6", label: "No Critical", value: "none" },
	{ id: 4, range: "7", label: "MP", value: "mp" },
	{ id: 5, range: "8", label: "No Critical", value: "none" },
	{ id: 6, range: "9", label: "MP", value: "mp" },
	{ id: 7, range: "10", label: "Unit Destroyed", value: "destroyed" },
	{ id: 8, range: "11-12", label: "Weapon", value: "weapon" }
];
const aeroCrits = [
	{ id: 0, range: "2", label: "Fuel Hit", value: "destroyed" },
	{ id: 1, range: "3", label: "Fire Control", value: "firecontrol" },
	{ id: 2, range: "4", label: "Engine", value: "engine" },
	{ id: 3, range: "5", label: "Weapon", value: "weapon" },
	{ id: 4, range: "6-8", label: "No Critical", value: "none" },
	{ id: 5, range: "9", label: "Weapon", value: "weapon" },
	{ id: 6, range: "10", label: "Engine", value: "engine" },
	{ id: 7, range: "11", label: "Fire Control", value: "firecontrol" },
	{ id: 8, range: "12", label: "Crew Killed", value: "destroyed" }
];
export const criticalLists = new Map<
	string,
	{ crits: { id: number; range: string; label: string; value: string }[]; motive?: { id: number; range: string; label: string; value: string }[] }
>([
	["BM", { crits: mechCrits }],
	["IM", { crits: mechCrits }],
	["CV", { crits: vehicleCrits, motive: motive }],
	["SV", { crits: vehicleCrits, motive: motive }],
	["PM", { crits: protoCrits }],
	["AF", { crits: aeroCrits }],
	["CF", { crits: aeroCrits }]
]);
