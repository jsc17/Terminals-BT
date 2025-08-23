type Item = {
	value: string;
	label: string;
	disabled?: boolean;
};

type MenuSimpleItem = {
	type: "item";
	label: string;
	onSelect: () => void;
};

type MenuCheck = {
	type: "check";
	label: string;
	checked: boolean;
	closeOnSelect?: boolean;
	onCheckedChange?: () => void;
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
	closeOnSelect?: boolean;
};

type MenuRadioGroup = {
	type: "radio";
	groupLabel: string;
	radios: MenuRadio[];
	get: () => string;
	set: (v: string) => void;
};

type Submenu = {
	type: "submenu";
	label: string;
	subitems: MenuItem[];
};

type MenuItem = MenuSimpleItem | MenuSeparator | MenuCheck | MenuRadioGroup | Submenu;

type Notification = {
	date: Date;
	read: boolean;
	summary: string;
	message: string;
	type: string;
};

export type { Item, MenuItem, Notification };
