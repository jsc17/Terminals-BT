export interface filter {
	name: string;
	label: string;
	type: "min" | "max" | "minMax" | "minGroup" | "string" | "select" | "abilities";
	value: string | number;
	default: string | number;
	maxValue?: number;
	maxDefault?: number;
	possible?: { value: string; display: string }[];
	properties?: string[];
	labels?: string[];
	values?: number[];
	defaults?: number[];
}
// { name: "name", type: "string", values: [{ label: "", value: "", default: "" }] },
