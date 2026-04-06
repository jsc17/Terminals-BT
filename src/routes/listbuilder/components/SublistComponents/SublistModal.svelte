<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { dndzone, dragHandleZone, type DndEvent } from "svelte-dnd-action";
	import SublistPrintModal from "./SublistPrintModal.svelte";
	import { getContext } from "svelte";
	import { List, type Sublist } from "$lib/types/list.svelte";
	import SublistCard from "./SublistCard.svelte";
	import EditSublistModal from "./EditSublistModal.svelte";
	import AutogenerationModal from "./AutogenerationModal.svelte";
	import { Dialog, Popover, DropdownMenu } from "$lib/generic";
	import type { SettingsOutput } from "../../types/settings";
	import PlayModal from "$lib/sharedDialogs/PlayModal.svelte";
	import type { MenuItem } from "$lib/generic/types";
	import { GearIcon, MenuIcon } from "$lib/icons";
	import * as v from "valibot";

	type Props = {
		list: List;
		open: boolean;
		playModal?: PlayModal;
	};

	let { list = $bindable(), open = $bindable(), playModal }: Props = $props();
	let settings: SettingsOutput = getContext("listbuilderSettings");

	let scenarioFilter = $state<string>("All");
	let flipDurationMs = 300;

	let sublistPrintModalOpen = $state(false);
	let sublistEditModalOpen = $state(false);
	let sublistAutoModalOpen = $state(false);

	let scenarioList = $derived.by(() => ["-"].concat(list.options?.sublistScenarios ?? []));
	let layout: "mobile" | "vertical" | "horizontal" = $derived(appWindow.isMobile ? "mobile" : settings.sublistUI.sublistOrientation);

	let dropTargetStyle = { outline: "none" };
	function handleSort(e: CustomEvent<DndEvent<Sublist>>) {
		list.sublists = e.detail.items;
	}

	let currentSublist = $state<Sublist>();

	function openSublistEditModal(id: string) {
		currentSublist = $state.snapshot(list.getSublist(id));
		sublistEditModalOpen = true;
	}

	let menuItems: MenuItem[] = [
		{
			type: "item",
			label: "Add Sublist",
			onSelect: () => {
				const idAdded = list.addSublist();
				openSublistEditModal(idAdded);
			}
		},
		{
			type: "item",
			label: "Print All Sublists",
			onSelect: () => {
				sublistPrintModalOpen = true;
			}
		},
		{
			type: "item",
			label: "Automatically Generate Sublists",
			onSelect: () => {
				sublistAutoModalOpen = true;
			}
		},
		{
			type: "item",
			label: "Clear All Sublists",
			onSelect: () => {
				if (confirm("Clear all sublists from the list?")) {
					list.clearSublists();
				}
			}
		}
	];

	const settingsMenuItems: MenuItem[] = [
		{
			type: "radio",
			groupLabel: "Display",
			radios: [
				{ label: "Vertical", value: "vertical" },
				{ label: "Horizontal", value: "horizontal" }
			],
			value: settings.sublistUI.sublistOrientation,
			onValueChange: (value) => {
				settings.sublistUI.sublistOrientation = v.parse(v.fallback(v.picklist(["vertical", "horizontal"]), "vertical"), value);
			}
		},
		{
			type: "radio",
			groupLabel: "Sublist unit sorting",
			radios: [
				{ label: "PV (High to Low)", value: "pv" },
				{ label: "PV (Low to High)", value: "pv-reverse" },
				{ label: "Name (A-Z)", value: "name" },
				{ label: "Name (Z-A)", value: "name-reverse" }
			],
			value: settings.sublistUI.sublistSortOrder,
			onValueChange: (value) => {
				settings.sublistUI.sublistSortOrder = v.parse(v.fallback(v.picklist(["pv", "pv-reverse", "name", "name-reverse"]), "pv"), value);
			}
		}
	];
</script>

{#snippet sublists()}
	{#each list.sublists as sublist (sublist.id)}
		{#if sublist.scenario == scenarioFilter || scenarioFilter == "All"}
			<div class:panel-vertical={layout == "vertical" && !appWindow.isMobile} class:panel-horizontal={layout == "horizontal" || appWindow.isMobile}>
				<SublistCard {sublist} {list} {scenarioList} unitSortOrder={settings.sublistUI.sublistSortOrder} {layout} {openSublistEditModal} {playModal}></SublistCard>
			</div>
		{/if}
	{/each}
	<div class:panel-vertical={layout == "vertical" && !appWindow.isMobile} class:panel-horizontal={layout == "horizontal" || appWindow.isMobile}>
		<button
			class="add-panel"
			onclick={() => {
				const idAdded = list.addSublist();
				openSublistEditModal(idAdded);
			}}
			>+
		</button>
	</div>
{/snippet}

<Dialog title="Sublists" triggerClasses="transparent-button" bind:open>
	{#snippet description()}
		<div class="space-between" style="gap: 32px">
			<div>
				<label for="scenarioFilter">Scenario:</label>
				<select id="scenarioFilter" bind:value={scenarioFilter}>
					{#each ["All"].concat(scenarioList) as scenario}
						<option value={scenario}>{scenario}</option>
					{/each}
				</select>
			</div>
			<div class="sublist-menus">
				<DropdownMenu items={settingsMenuItems}>
					{#snippet trigger()}
						<div class="sublist-menu-button">
							<GearIcon width="15" height="15" />
						</div>
					{/snippet}
				</DropdownMenu>
				<DropdownMenu items={menuItems}>
					{#snippet trigger()}
						<div class="sublist-menu-button">
							<MenuIcon width="15" height="15" />
						</div>
					{/snippet}
				</DropdownMenu>
			</div>
		</div>
	{/snippet}
	<div class="sublist-modal-content">
		{#if appWindow.isMobile}
			<div
				class="sublist-modal-sublist-container sublist-modal-sublist-container-mobile"
				use:dragHandleZone={{
					items: list.sublists,
					dropTargetStyle,
					flipDurationMs,
					dragDisabled: scenarioFilter != "All"
				}}
				onconsider={handleSort}
				onfinalize={handleSort}
			>
				{@render sublists()}
			</div>
		{:else}
			<div
				class="sublist-modal-sublist-container"
				use:dndzone={{
					items: list.sublists,
					dropTargetStyle,
					flipDurationMs,
					dragDisabled: scenarioFilter != "All"
				}}
				onconsider={handleSort}
				onfinalize={handleSort}
				class:sublist-modal-sublist-container-vertical={layout == "vertical"}
				class:sublist-modal-sublist-container-horizontal={layout == "horizontal"}
			>
				{@render sublists()}
			</div>
		{/if}
	</div>
</Dialog>

<EditSublistModal {list} sublist={currentSublist} bind:open={sublistEditModalOpen} />
<SublistPrintModal {list} bind:open={sublistPrintModalOpen} />
<AutogenerationModal {list} bind:open={sublistAutoModalOpen} />

<style>
	.sublist-modal-content {
		width: calc(99dvw - 32px);
		display: flex;
		height: 80dvh;
	}
	.sublist-modal-sublist-container {
		display: flex;
	}
	.sublist-modal-sublist-container-horizontal,
	.sublist-modal-sublist-container-mobile {
		width: 100%;
		flex-direction: column;
	}
	.sublist-modal-sublist-container-vertical {
		scrollbar-width: auto;
	}
	.sublist-menus {
		display: flex;
		gap: 4px;
		align-items: center;
	}
	.sublist-menu-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0px 12px;
	}
	.add-panel {
		flex-shrink: 0;
		font-size: 10vmin;
		border: 1px solid var(--border);
		background-color: var(--surface-color);
		color: var(--text-color);
		height: 100%;
		width: 100%;
	}
	.panel-vertical {
		margin: 0px 4px;
		width: 220px;
		flex-shrink: 0;
	}
	.panel-horizontal {
		margin: 2px 0px;
		width: 100%;
		flex-shrink: 0;
		min-height: 100px;
	}
</style>
