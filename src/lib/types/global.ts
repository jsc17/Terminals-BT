type Item = {
	value: string;
	label: string;
	disabled?: boolean;
};

type Notification = {
	date: Date;
	read: boolean;
	summary: string;
	message: string;
	type: string;
};

export type { Item, Notification };
