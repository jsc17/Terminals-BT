<script lang="ts">
	import { goto } from "$app/navigation";
	import { MenuBar } from "$lib/generic";
	import type { PlaymodeOptionsOutput } from "$routes/play/schema/playmode";
	import * as v from "valibot";
	import type { PlayList } from "$routes/play/types/types";
	import type { MenuBarItem, MenuItem } from "$lib/generic/types";

	type Props = {
		options: PlaymodeOptionsOutput;
		username?: string;
		myData?: { playerNickname: string; id: number; joined: boolean };
		componentsOpen: { join: boolean; addList: boolean; matchLog: boolean; roundSummaries: boolean };
		matchLists: PlayList[];
		roundSummariesExist: boolean;
	};

	let { options = $bindable(), username, myData, componentsOpen, matchLists, roundSummariesExist }: Props = $props();

	const settingsMenuOptions = $derived<MenuItem[]>([
		{ type: "number", label: "Cards Per Row", value: options.cardsPerRow, onValueChange: (v: number) => (options.cardsPerRow = v) },
		{
			type: "check",
			label: "Display Original Values when damaged",
			checked: options.renderOriginal,
			onCheckedChange: (v: boolean) => (options.renderOriginal = v)
		},
		{
			type: "check",
			label: "Show physical damage values on unit card",
			checked: options.showPhysical,
			onCheckedChange: (v: boolean) => (options.showPhysical = v)
		},
		{ type: "check", label: "Show unit crippled at half structure", checked: options.showCrippled, onCheckedChange: (v: boolean) => (options.showCrippled = v) },
		{ type: "check", label: "Show units jump TMM", checked: options.showJumpTMM, onCheckedChange: (v: boolean) => (options.showJumpTMM = v) },
		// { type: "check", label: "Group units by formation", checked: options.groupByFormation, onCheckedChange: (v: boolean) => (options.groupByFormation = v) },
		{
			type: "radio",
			groupLabel: "Measurement Units",
			radios: [
				{ label: "Inches", value: "inches" },
				{ label: "Hexes", value: "hexes" }
			],
			value: options.measurementUnits,
			onValueChange: (newValue: string) => (options.measurementUnits = v.parse(v.fallback(v.union([v.literal("inches"), v.literal("hexes")]), "inches"), newValue)),
			closeOnSelect: false
		},
		{
			type: "radio",
			groupLabel: "Damage Pip Direction",
			radios: [
				{ label: "Right to Left, as Blake intended", value: "left" },
				{ label: "Left to Right, like a Nicholai Malthus Fanboy", value: "right" }
			],
			value: options.damageDirection,
			onValueChange: (newValue: string) => (options.damageDirection = v.parse(v.fallback(v.union([v.literal("left"), v.literal("right")]), "left"), newValue)),
			closeOnSelect: false
		},
		{
			type: "radio",
			groupLabel: "Duplicate Unit Markings",
			radios: [
				{ label: "Numbers", value: "numbers" },
				{ label: "Letters", value: "letters" },
				{ label: "Roman Numerals", value: "roman" }
			],
			value: options.duplicateUnitMarkings,
			onValueChange: (newValue: string) =>
				(options.duplicateUnitMarkings = v.parse(v.fallback(v.union([v.literal("numbers"), v.literal("letters"), v.literal("roman")]), "numbers"), newValue)),
			closeOnSelect: false
		}
	]);

	const playerMenuItems: MenuItem[] = $derived([
		...(!username ? [{ type: "info", label: `Please login to join match` } satisfies MenuItem] : []),
		...(!myData
			? [{ type: "item", label: "Join Match", onSelect: () => (componentsOpen.join = true) } satisfies MenuItem]
			: !myData.joined
				? [{ type: "info", label: `Waiting for host to approve match join` } satisfies MenuItem]
				: ([
						{ type: "info", label: `Joined match as ${myData.playerNickname}` },
						{ type: "item", label: matchLists.find((l) => l.owner == myData?.id) ? "Load Additional List" : "Load List", onSelect: () => (componentsOpen.addList = true) }
					] satisfies MenuItem[])),
		{ type: "item", label: "Return to match selection", onSelect: () => goto("/play") }
	]);
	const menubarItems: MenuBarItem[] = $derived([
		{ type: "submenu", label: "Menu", subitems: playerMenuItems },
		{ type: "submenu", label: "Display Settings", subitems: settingsMenuOptions },
		{ type: "item", label: "Match Logs", onSelect: () => (componentsOpen.matchLog = true) },
		...(roundSummariesExist ? [{ type: "item", label: "Round Summaries", onSelect: () => (componentsOpen.roundSummaries = true) } satisfies MenuBarItem] : [])
	]);
</script>

<MenuBar items={menubarItems} />
