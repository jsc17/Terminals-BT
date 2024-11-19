type DefaultFilter = {
	name: string;
	label: string;
	type: "number" | "numberGroup" | "string" | "select" | "abilities";
	value?: string | number;
	maxValue?: number;
	possible?: { value: string; display: string }[];
	properties?: string[];
	labels?: string[];
	values?: { min?: number; max?: number }[];
	defaults?: number[];
};

type NumberFilter = {
	name: string;
	label: string;
	type: "number";
	valueMin: number;
	valueMax: number;
};

type UniqueFilter = {
	name: string;
	label: string;
	type: "unique";
	checked: boolean;
};

type MovementFilter = {
	name: string;
	label: string;
	type: "movement";
	speedMinValue?: number;
	speedMaxValue?: number;
	typeValue: string;
	possibleTypeValues: { value: string; display: string }[];
}

export type Filter = DefaultFilter | UniqueFilter | MovementFilter;
// { name: "name", type: "string", values: [{ label: "", value: "", default: "" }] },
