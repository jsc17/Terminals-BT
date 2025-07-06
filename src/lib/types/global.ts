type Item = {
	value: string;
	label: string;
	disabled?: boolean;
};

type MenuButton = {
	type: "item";
	label: string;
	onSelect: () => void;
};

type MenuSeparator = {
	type: "separator";
	classes?: string;
};

type MenuItem = MenuButton | MenuSeparator;

type Notification = {
	date: Date;
	read: boolean;
	summary: string;
	message: string;
	type: string;
};

export type { Item, MenuItem, Notification };
