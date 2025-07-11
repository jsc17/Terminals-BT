type PrintSettings = {
	printingStyle: "mul" | "detailed";
	printFormations: boolean;
	printCardsByFormation: boolean;
	cardStyle: "mul" | "generated";
	formationHeaderStyle: "inline" | "side";
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
