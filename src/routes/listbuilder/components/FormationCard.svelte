<script lang="ts">
	import UnitCard from "./UnitCard.svelte";
	import { dndzone, dragHandleZone, type DndEvent, dragHandle } from "svelte-dnd-action";
	import { toastController } from "$lib/stores/toastController.svelte";
	import Menu from "$lib/components/Generic/Menu.svelte";
	import { getContext } from "svelte";
	import type { List } from "../types/list.svelte";
	import { type FormationV2, formationTypes } from "../types/formation";
	import { exportToJeff } from "../utilities/export.svelte";
	import { appWindow } from "$lib/stores/appWindow.svelte";

	let list: List = getContext("list");
	let { formation }: { formation: FormationV2 } = $props();

	let dropTargetStyle = {};
	let flipDurationMs = 100;

	function handleSort(e: CustomEvent<DndEvent<{ id: string }>>) {
		formation.units = e.detail.items;
	}

	function exportFormationToJeff() {
		if (formation.units.length == 0) {
			toastController.addToast("Formation is empty");
		} else {
			const units = formation.units.map((unitId) => list.getUnit(unitId.id)!);
			exportToJeff(formation.name, units);
		}
	}
</script>

{#snippet jeffExportButton()}
	<button class="menu-button" onclick={exportFormationToJeff}>Export Formation to Jeff's Tools </button>
{/snippet}

<div class="formation-card">
	{#if formation.id == "unassigned"}
		{#if list.formations.length != 1}
			<div class="formation-header">
				{#if appWindow.isMobile}
					<div class="drag-handles" use:dragHandle>
						<img class="combobox-img" src="/icons/chevron-updown.svg" alt="expand list chevrons" />
					</div>
				{/if}
				Unassigned Units
				<Menu img={"/icons/menu.svg"}>
					{@render jeffExportButton()}
				</Menu>
			</div>
		{/if}
	{:else}
		<div class="formation-header">
			{#if appWindow.isMobile}
				<div class="drag-handles" use:dragHandle>
					<img class="combobox-img" src="/icons/chevron-updown.svg" alt="expand list chevrons" />
				</div>
			{/if}
			<input class="formation-name" type="text" name="formation-name" id="formation-id" bind:value={formation.name} />
			<select class="formation-type-select" name="formation-type" bind:value={formation.type}>
				{#each formationTypes as formationType}
					<option value={formationType}>{formationType}</option>
				{/each}
			</select>
			<Menu img={"/icons/menu.svg"}>
				{@render jeffExportButton()}
				<button
					class="menu-button"
					onclick={() => {
						if (formation.units.length == 0 || confirm("Formation is not empty and removing it will remove all units it contains. Continue?")) {
							list.removeFormation(formation.id);
							toastController.addToast(`${formation.name} removed from list`);
						}
					}}>Remove</button
				>
			</Menu>
		</div>
	{/if}
	{#if !formation.units.length}
		<div class="drop-message">Drop units here to add them to this formation</div>
	{/if}
	{#if appWindow.isMobile}
		<div
			class="unit-cards"
			use:dragHandleZone={{ items: formation.units, dropTargetStyle, dropTargetClasses: ["droppable"], flipDurationMs, type: "units" }}
			onconsider={handleSort}
			onfinalize={handleSort}
		>
			{#each formation.units as unit (unit.id)}
				<UnitCard unitId={unit.id}></UnitCard>
			{/each}
		</div>
	{:else}
		<div
			class="unit-cards"
			use:dndzone={{ items: formation.units, dropTargetStyle, dropTargetClasses: ["droppable"], flipDurationMs, type: "units" }}
			onconsider={handleSort}
			onfinalize={handleSort}
		>
			{#each formation.units as unit (unit.id)}
				<UnitCard unitId={unit.id}></UnitCard>
			{/each}
		</div>
	{/if}
</div>

<style>
	.menu-button {
		background-color: transparent;
		color: var(--primary);
	}
	.formation-card {
		position: relative;
		width: 100%;
		background-color: var(--card);
		flex-shrink: 0;
	}
	.formation-card:hover {
		box-shadow: 3px 0px 3px var(--primary) inset;
		cursor: row-resize;
	}
	.formation-header {
		padding: 4px;
		background-color: var(--background);
		display: flex;
		justify-content: space-between;
		align-items: center;
		border: 1px solid var(--border);
		gap: 4px;
	}
	.unit-cards {
		padding: 2px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	:global(.droppable) {
		outline: 1px solid var(--primary);
		min-height: 2em;
	}
	input {
		background-color: var(--muted);
	}
	input:hover {
		border: 1px solid var(--primary);
	}
	.formation-type-select {
		flex: 1;
	}
	.drop-message {
		margin-top: 4px;
		align-self: center;
		justify-self: center;
	}
	.drag-handles {
		display: flex;
		align-items: center;
		justify-items: center;
	}
</style>
