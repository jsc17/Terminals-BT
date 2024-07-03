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

export type Filter = DefaultFilter | UniqueFilter;
// { name: "name", type: "string", values: [{ label: "", value: "", default: "" }] },
