<script lang="ts">
	import { goto } from "$app/navigation";
	import { DropdownMenu } from "$lib/generic";
	import type { MenuItem } from "$lib/generic/types";
	import { genericGetSet } from "$lib/utilities/utilities";
	import type { PlaymodeOptionsOutput } from "$routes/play/schema/playmode";
	import * as v from "valibot";

	type Props = {
		options: PlaymodeOptionsOutput;
		username?: string;
		myData?: { playerNickname: string };
		componentsOpen: { join: boolean };
	};

	let { options = $bindable(), username, myData, componentsOpen }: Props = $props();

	const settingsMenuOptions = $state<MenuItem[]>([
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

	const standardMenuOptions: MenuItem[] = $derived.by(() => {
		//login or join match
		//settings
		//return to match selection
		let options: MenuItem[] = [];

		if (!username) options.push({ type: "info", label: `Please login to join match` });
		if (!myData) options.push({ type: "item", label: "Join Match", onSelect: () => (componentsOpen.join = true) });
		else options.push({ type: "info", label: `Joined match as ${myData.playerNickname}` });

		options = options.concat([
			{ type: "submenu", label: "Display Settings", subitems: [...settingsMenuOptions] },
			{ type: "separator" },
			{ type: "item", label: "Return to match selection", onSelect: () => goto("/play") }
		]);

		return options;
	});
</script>

<DropdownMenu items={standardMenuOptions} triggerClasses="detailed-button">
	{#snippet trigger()}
		Menu
	{/snippet}
</DropdownMenu>
