export const submittedList = $state<{
	name?: string;
	data?: Blob;
	era?: number;
	faction?: number;
	rules?: string;
}>({ name: undefined, data: undefined, era: undefined, faction: undefined, rules: undefined });
