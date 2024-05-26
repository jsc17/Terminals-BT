export interface filter {
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
}
// { name: "name", type: "string", values: [{ label: "", value: "", default: "" }] },
