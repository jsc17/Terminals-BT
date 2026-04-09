import { type battlefieldSupportCard } from "$lib/types/battlefieldSupport";

const battlefieldSupportGroups = ["Offensive Aerospace Support", "Defensive Aerospace Support", "Artillery Support", "Minefield Support"];

const battlefieldSupport: battlefieldSupportCard[] = [
	{ id: 0, pack: "core", source: "AS:CE pg.54", group: "Offensive Aerospace Support", name: "Light Strike", bspCost: 2 },
	{ id: 1, pack: "core", source: "AS:CE pg.54", group: "Offensive Aerospace Support", name: "Light Bombing", bspCost: 3 },
	{ id: 2, pack: "core", source: "AS:CE pg.54", group: "Offensive Aerospace Support", name: "Heavy Strike", bspCost: 3 },
	{ id: 3, pack: "core", source: "AS:CE pg.54", group: "Offensive Aerospace Support", name: "Heavy Bombing", bspCost: 4 },
	{ id: 4, pack: "core", source: "AS:CE pg.55", group: "Offensive Aerospace Support", name: "Strafing", bspCost: 5 },
	{ id: 5, pack: "core", source: "AS:CE pg.55", group: "Defensive Aerospace Support", name: "Light Air Cover", bspCost: 1 },
	{ id: 6, pack: "core", source: "AS:CE pg.55", group: "Defensive Aerospace Support", name: "Heavy Air Cover", bspCost: 2 },
	{ id: 7, pack: "core", source: "AS:CE pg.56", group: "Artillery Support", name: "Thumper", bspCost: 2 },
	{ id: 8, pack: "core", source: "AS:CE pg.56", group: "Artillery Support", name: "Sniper", bspCost: 3 },
	{ id: 9, pack: "core", source: "AS:CE pg.56", group: "Artillery Support", name: "Long Tom", bspCost: 5 },
	{ id: 10, pack: "core", source: "AS:CE pg.56", group: "Minefield Support", name: "Light Density", bspCost: 0.5 },
	{ id: 11, pack: "core", source: "AS:CE pg.56", group: "Minefield Support", name: "Medium Density", bspCost: 2 },
	{ id: 12, pack: "core", source: "AS:CE pg.56", group: "Minefield Support", name: "Heavy Density", bspCost: 5 },
	{ id: 13, pack: "wn350v3", source: "WN350 pg.13", group: "Off-Board Artillery", name: "Off-Board Artillery Support - Thumper", pvCost: 5 },
	{ id: 14, pack: "wn350v3", source: "WN350 pg.13", group: "Off-Board Artillery", name: "Off-Board Artillery Support - Sniper", pvCost: 8 }
];

function getBSCbyId(id: number): battlefieldSupportCard | undefined {
	const bs = battlefieldSupport.find((bs) => bs.id == id);
	return bs;
}

function getBFSPacks(packNames: string[]) {
	const availableBFS = battlefieldSupport.filter((bs) => packNames.includes(bs.pack));
	return Map.groupBy(availableBFS, (bs) => bs.group);
}

export { battlefieldSupportGroups, type battlefieldSupportCard, battlefieldSupport, getBSCbyId, getBFSPacks };
