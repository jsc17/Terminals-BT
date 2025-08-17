type PrintSettings = {
	printingStyle: "mul" | "detailed";
	printFormations: boolean;
	printCardsByFormation: boolean;
	printFormationBonuses: boolean;
	cardStyle: "mul" | "generated";
	formationHeaderStyle: "inline" | "side";
	measurementUnits: "inches" | "hexes";
};

type SublistUISettings = {
	sublistOrientation: "vertical" | "horizontal";
	sublistSortOrder: "pv" | "name";
	sublistPrintListSettings: PrintSettings;
	sublistPrintAllOrientation: "vertical" | "horizontal";
	sublistPrintAllGroupByScenario: boolean;
};

type Settings = {
	print: PrintSettings;
	sublistUI: SublistUISettings;
};
