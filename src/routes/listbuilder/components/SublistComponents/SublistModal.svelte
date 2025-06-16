<script lang="ts">
	import { appWindow } from "$lib/global/stores/appWindow.svelte";
	import { dndzone, dragHandleZone, type DndEvent } from "svelte-dnd-action";
	import SublistPrintModal from "./SublistPrintModal.svelte";
	import Sublist from "./Sublist.svelte";
	import { getContext } from "svelte";
	import { List, type SublistV2 } from "$lib/types/";
	import EditSublistModal from "./EditSublistModal.svelte";
	import AutogenerationModal from "./AutogenerationModal.svelte";
	import { Dialog, Popover } from "$lib/global/components";

	type Props = {
		list: List;
	};

	let { list = $bindable() }: Props = $props();
	let settings: Settings = getContext("listbuilderSettings");

	let scenarioFilter = $state<string>("All");
	let flipDurationMs = 300;

	let sublistPrintModalOpen = $state(false);
	let sublistEditModalOpen = $state(false);
	let sublistAutoModalOpen = $state(false);

	let scenarioList = $derived.by(() => ["-"].concat(list.options?.sublistScenarios ?? []));
	let layout: "mobile" | "vertical" | "horizontal" = $derived(appWindow.isMobile ? "mobile" : settings.sublistUI.sublistOrientation);

	let dropTargetStyle = { outline: "none" };
	function handleSort(e: CustomEvent<DndEvent<SublistV2>>) {
		list.sublists = e.detail.items;
	}

	let currentSublist = $state<SublistV2>();

	function openSublistEditModal(id: string) {
		currentSublist = $state.snapshot(list.getSublist(id));
		sublistEditModalOpen = true;
	}
</script>

{#snippet sublists()}
	{#each list.sublists as sublist (sublist.id)}
		{#if sublist.scenario == scenarioFilter || scenarioFilter == "All"}
			<div class:panel-vertical={layout == "vertical" && !appWindow.isMobile} class:panel-horizontal={layout == "horizontal" || appWindow.isMobile}>
				<Sublist {sublist} {list} {scenarioList} unitSortOrder={settings.sublistUI.sublistSortOrder} {layout} {openSublistEditModal}></Sublist>
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

<Dialog title="Sublists" triggerClasses="transparent-button">
	{#snippet trigger()}
		Generate Sublists
	{/snippet}
	{#snippet description()}
		<div class="space-between">
			<div>
				<label for="scenarioFilter">Scenario:</label>
				<select id="scenarioFilter" bind:value={scenarioFilter}>
					{#each ["All"].concat(scenarioList) as scenario}
						<option value={scenario}>{scenario}</option>
					{/each}
				</select>
			</div>
			<div class="sublist-menus">
				<Popover>
					{#snippet trigger()}
						<div class="sublist-modal-menu-button">
							<img src="/icons/settings.svg" alt="settings menu" />
						</div>
					{/snippet}
					<div class="sublist-modal-menu-body">
						{#if !appWindow.isMobile}
							<fieldset>
								<legend>Display</legend>
								<label><input type="radio" name="layout" bind:group={settings.sublistUI.sublistOrientation} value="vertical" /> Vertical</label>
								<label><input type="radio" name="layout" bind:group={settings.sublistUI.sublistOrientation} value="horizontal" /> Horizontal</label>
							</fieldset>
						{/if}
						<fieldset>
							<legend>Sublist unit sorting</legend>
							<label><input type="radio" name="unitSortOrder" bind:group={settings.sublistUI.sublistSortOrder} value="pv" /> PV</label>
							<label><input type="radio" name="unitSortOrder" bind:group={settings.sublistUI.sublistSortOrder} value="name" /> Name</label>
						</fieldset>
					</div>
				</Popover>
				<Popover>
					{#snippet trigger()}
						<div class="sublist-modal-menu-button">
							<img src="/icons/menu.svg" alt="sublist menu" />
						</div>
					{/snippet}
					<div class="sublist-modal-menu-body">
						<button
							class="transparent-button"
							onclick={() => {
								const idAdded = list.addSublist();
								openSublistEditModal(idAdded);
							}}
							>Add Sublist
						</button>
						<button class="transparent-button" onclick={() => (sublistPrintModalOpen = true)}>Print All Sublists</button>
						<button class="transparent-button" onclick={() => (sublistAutoModalOpen = true)}>Automatically Generate Sublists</button>
					</div>
				</Popover>
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
		height: 85dvh;
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
	.sublist-modal-menu-button {
		background-color: var(--primary);
		border-radius: var(--radius);
		padding: 0px 16px;

		& img {
			height: 20px;
			width: 20px;
		}
	}
	.sublist-modal-menu-body {
		display: flex;
		flex-direction: column;
		padding: 16px;
		gap: 8px;
	}
	.add-panel {
		flex-shrink: 0;
		font-size: 10vmin;
		border: 1px solid var(--border);
		background-color: var(--card);
		color: var(--card-foreground);
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
	fieldset {
		border: 2px solid var(--border);
		display: flex;
		flex-direction: column;
	}
	legend {
		color: var(--muted-foreground);
	}
	fieldset label {
		color: var(--muted-foreground);
	}
</style>
