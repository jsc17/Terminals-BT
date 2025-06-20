const battlefieldSupportGroups = ["Offensive Aerospace Support", "Defensive Aerospace Support", "Artillery Support", "Minefield Support"];

type battlefieldSupportCard = {
	id: number;
	source: string;
	group: string;
	name: string;
	btn: string;
	dmg: string;
	bspCost: number;
};

const battlefieldSupport = [
	{ id: 0, source: "AS:CE", group: "Offensive Aerospace Support", name: "Light Strike", btn: "5", dmg: "1", bspCost: 2 },
	{ id: 1, source: "AS:CE", group: "Offensive Aerospace Support", name: "Light Bombing", btn: "5", dmg: "1", bspCost: 3 },
	{ id: 2, source: "AS:CE", group: "Offensive Aerospace Support", name: "Heavy Strike", btn: "6", dmg: "2", bspCost: 3 },
	{ id: 3, source: "AS:CE", group: "Offensive Aerospace Support", name: "Heavy Bombing", btn: "7", dmg: "2", bspCost: 4 },
	{ id: 4, source: "AS:CE", group: "Offensive Aerospace Support", name: "Strafing", btn: "7", dmg: "2", bspCost: 5 },
	{ id: 5, source: "AS:CE", group: "Defensive Aerospace Support", name: "Light Air Cover", btn: "Varies", dmg: "-", bspCost: 1 },
	{ id: 6, source: "AS:CE", group: "Defensive Aerospace Support", name: "Heavy Air Cover", btn: "Varies", dmg: "-", bspCost: 2 },
	{ id: 7, source: "AS:CE", group: "Artillery Support", name: "Thumper", btn: "7", dmg: "1", bspCost: 2 },
	{ id: 8, source: "AS:CE", group: "Artillery Support", name: "Sniper", btn: "8", dmg: "2", bspCost: 3 },
	{ id: 9, source: "AS:CE", group: "Artillery Support", name: "Long Tom", btn: "9", dmg: "3/1", bspCost: 5 },
	{ id: 10, source: "AS:CE", group: "Minefield Support", name: "Light Density", btn: "9", dmg: "1", bspCost: 0.5 },
	{ id: 11, source: "AS:CE", group: "Minefield Support", name: "Medium Density", btn: "8", dmg: "2", bspCost: 2 },
	{ id: 12, source: "AS:CE", group: "Minefield Support", name: "Heavy Density", btn: "7", dmg: "3", bspCost: 5 }
];

function getBSCbyId(id: number): battlefieldSupportCard | undefined {
	const bs = battlefieldSupport.find((bs) => bs.id == id);
	return bs;
}

export { battlefieldSupportGroups, type battlefieldSupportCard, battlefieldSupport, getBSCbyId };
