<script lang="ts">
	import UnitCard from "./UnitCard.svelte";
	import { dndzone, type DndEvent } from "svelte-dnd-action";
	import { toastController } from "$lib/stores/toastController.svelte";
	import Menu from "$lib/components/Menu.svelte";
	import { getContext } from "svelte";
	import type { List } from "../types/list.svelte";
	import { type FormationV2, airFormationTypes, groundFormationTypes } from "$lib/types/formation";

	let list: List = getContext("list");
	let { formation }: { formation: FormationV2 } = $props();

	let dropTargetStyle = { outline: "1px solid var(--primary)" };
	let flipDurationMs = 100;

	function handleSort(e: CustomEvent<DndEvent<{ id: string }>>) {
		formation.units = e.detail.items;
	}
</script>

<main>
	{#if formation.id == "unassigned"}
		{#if list.formations.length != 1}
			<div class="formation-header">Unassigned units</div>
		{/if}
	{:else}
		<div class="formation-header">
			<input type="text" name="formation-name" id="formation-id" bind:value={formation.name} />
			<div class="inline">
				<label for="formation-type">{formation.style.charAt(0).toUpperCase()}</label>
				<select name="formation-type" bind:value={formation.type}>
					{#if formation.style == "ground"}
						{#each groundFormationTypes as formationType}
							<option value={formationType}>{formationType}</option>
						{/each}
					{:else}
						{#each airFormationTypes as formationType}
							<option value={formationType}>{formationType}</option>
						{/each}
					{/if}
				</select>
			</div>
			<Menu img={"/icons/menu.svg"}>
				<button
					class="menu-button"
					onclick={() => {
						if (formation.units.length == 0 || confirm("Formation is not empty and removing it will remove all units it contains. Continue?")) {
							list.removeFormation(formation.id);
							toastController.addToast(`${formation.name} removed from list`);
						}
					}}>Remove</button
				></Menu
			>
		</div>
	{/if}
	<div class="unit-cards" use:dndzone={{ items: formation.units, dropTargetStyle, flipDurationMs, type: "units" }} onconsider={handleSort} onfinalize={handleSort}>
		{#each formation.units as unit (unit.id)}
			<UnitCard unitId={unit.id}></UnitCard>
		{/each}
	</div>
	{#if !formation.units.length}
		<div class="center overlay">Drop units here to add them to this formation</div>
	{/if}
</main>

<style>
	.menu-button {
		background-color: transparent;
		color: var(--primary);
	}
	main {
		position: relative;
		/* border: 1px solid var(--border); */
		width: 100%;
		background-color: var(--card);
	}
	main:hover {
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
	}
	.unit-cards {
		min-height: 50px;
		padding: 2px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	input {
		background-color: var(--muted);
	}
	input:hover {
		border: 1px solid var(--primary);
	}
</style>
