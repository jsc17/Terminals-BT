type Item = {
	value: string;
	label: string;
	disabled?: boolean;
};

type MenuGetSet<T> = {
	get: () => T;
	set: (v: T) => void;
};

type MenuSimpleItem = {
	type: "item";
	label: string;
	onSelect?: () => void;
};

type MenuInfoItem = {
	type: "info";
	label: string;
};

type MenuHiddenInfoItem = {
	type: "hiddenInfo";
	label: string;
	hidden: string;
};

type MenuCheck = {
	type: "check";
	label: string;
	checked: boolean;
	closeOnSelect?: boolean;
	onCheckedChange?: (v: boolean) => void;
	disabled?: boolean;
};

type MenuSeparator = {
	type: "separator";
	classes?: string;
};

type MenuRadio = {
	label: string;
	value: string;
	disabled?: boolean;
};

type MenuRadioGroup = {
	type: "radio";
	groupLabel: string;
	radios: MenuRadio[];
	onValueChange: (v: string) => void;
	closeOnSelect?: boolean;
	value: string;
};

type Submenu = {
	type: "submenu";
	label: string;
	subitems: MenuItem[];
};

type MenuNumber = {
	type: "number";
	label: string;
	value: number;
	onValueChange: (v: number) => void;
	min?: number;
	max?: number;
	step?: number;
};

type MenuItem = MenuSimpleItem | MenuSeparator | MenuCheck | MenuRadioGroup | Submenu | MenuInfoItem | MenuHiddenInfoItem | MenuNumber;

type Notification = {
	date: Date;
	read: boolean;
	summary: string;
	message: string;
	type: string;
};

export type { Item, MenuItem, Notification };
