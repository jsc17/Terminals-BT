<script lang="ts">
	import { unitTypes } from "$lib/types/ValidationList";
	import { type Formation, type Unit, formationTypes, isUnit } from "$lib/types/unit";
	import UnitCard from "./UnitCard.svelte";
	import { dndzone, type DndEvent, dragHandleZone, dragHandle } from "svelte-dnd-action";

	let { unit: formation }: { unit: Formation } = $props();

	let dropTargetStyle = { outline: "1px solid var(--primary)" };
	let flipDurationMs = 100;

	function handleConsider(e: CustomEvent<DndEvent<Unit>>) {
		formation.units = e.detail.items;
	}

	function handleFinalize(e: CustomEvent<DndEvent<Unit>>) {
		formation.units = e.detail.items;
	}
</script>

<main>
	<div class="formation-header">
		<input type="text" name="formation-name" id="formation-id" value={formation.name} />
		<select name="formation-type" value={formation.type}>
			{#each formationTypes as formationType}
				<option value={formationType}>{formationType}</option>
			{/each}
		</select>
	</div>
	<div class="unit-cards" use:dndzone={{ items: formation.units, dropTargetStyle, flipDurationMs }} onconsider={handleConsider} onfinalize={handleFinalize}>
		{#each formation.units as unit, index (unit.id)}
			<UnitCard {unit} {index}></UnitCard>
		{/each}
		{#if formation.units.length == 0}
			<p>Drag units here to add to formation</p>
		{/if}
	</div>
</main>

<style>
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
		border: 1px solid var(--border);
	}
	.unit-cards {
		min-height: 30px;
		padding: 8px;
	}
	input {
		background-color: var(--muted);
	}
	input:hover {
		border: 1px solid var(--primary);
	}
</style>
