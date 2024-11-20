type NumberFilter = {
	name: string;
	label: string;
	type: "number";
	valueMin?: number;
	valueMax?: number;
};

type NumberGroupFilter = {
	name: string;
	label: string;
	type: "numberGroup";
	properties?: string[];
	labels?: string[];
	values?: { min?: number; max?: number }[];
	defaults?: number[];
}

type StringFilter = {
	name: string;
	label: string;
	type: "string";
	value: string;
}

type SelectFilter = {
	name: string;
	label: string;
	type: "select";
	value: string;
	possibleValues: { value: string; display: string }[];
}

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

type AbilityFilter = {
	name: string;
	label: string;
	type: "abilities";
	value: string;
}

export type Filter = AbilityFilter | UniqueFilter | MovementFilter | StringFilter | NumberFilter | SelectFilter | NumberGroupFilter;
// { name: "name", type: "string", values: [{ label: "", value: "", default: "" }] },
