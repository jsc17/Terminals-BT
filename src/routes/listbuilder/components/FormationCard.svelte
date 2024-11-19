<script lang="ts">
	import { type Formation, groundFormationTypes, airFormationTypes, dragType } from "$lib/types/formation.svelte";
	import { type Unit } from "$lib/types/unit";
	import UnitCard from "./UnitCard.svelte";
	import { dndzone, type DndEvent, dragHandleZone, dragHandle } from "svelte-dnd-action";
	import { toastController } from "$lib/stores/toastController.svelte";
	import Menu from "$lib/components/Menu.svelte";
	import type { UnitList } from "$lib/types/list.svelte";
	import { getContext } from "svelte";

	let list: UnitList = getContext("list");
	let { unit: formation }: { unit: Formation } = $props();

	let dropTargetStyle = { outline: "1px solid var(--primary)" };
	let flipDurationMs = 100;

	function handleConsider(e: CustomEvent<DndEvent<Unit>>) {
		formation.units = e.detail.items;
	}

	function handleFinalize(e: CustomEvent<DndEvent<Unit>>) {
		formation.units = e.detail.items;
	}

	$effect(() => {
		console.log(formation.type);
	});
</script>

<main>
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
						list.remove(formation.id!);
						toastController.addToast(`${formation.name} removed from list`);
					}
				}}>Remove</button
			></Menu
		>
	</div>
	<div class="unit-cards" use:dndzone={{ items: formation.units, dropTargetStyle, flipDurationMs, type: dragType.type }} onconsider={handleConsider} onfinalize={handleFinalize}>
		{#each formation.units as unit (unit.id)}
			<UnitCard {unit}></UnitCard>
		{/each}
	</div>
</main>

<style>
	.menu-button {
		background-color: transparent;
		color: var(--primary);
	}
	main {
		width: 100%;
		padding: 4px;
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
		padding: 8px;
	}
	input {
		background-color: var(--muted);
	}
	input:hover {
		border: 1px solid var(--primary);
	}
</style>
