type Item = {
	value: string;
	label: string;
	disabled?: boolean;
};

type MenuSimpleItem = {
	type: "item";
	label: string;
	onSelect?: () => void;
	disabled?: boolean;
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

type MenuLink = {
	type: "link";
	label: string;
	href: string;
};

type MenuItem = MenuSimpleItem | MenuSeparator | MenuCheck | MenuRadioGroup | Submenu | MenuInfoItem | MenuHiddenInfoItem | MenuNumber | MenuLink;
type MenuBarItem = MenuSimpleItem | Submenu;

type Notification = {
	date: Date;
	read: boolean;
	summary: string;
	message: string;
	type: string;
};

export type { Item, MenuItem, MenuBarItem, Notification };
