<script lang="ts">
	import { type Formation, formationTypes, formationDragStatus, isFormation } from "../formation.svelte";
	import { type Unit } from "../unit";
	import UnitCard from "./UnitCard.svelte";
	import { dndzone, type DndEvent, dragHandleZone, dragHandle } from "svelte-dnd-action";
	import { list } from "../list.svelte";
	import { toastController } from "$lib/stores/toastController.svelte";

	let { unit: formation }: { unit: Formation } = $props();

	let dropTargetStyle = { outline: "1px solid var(--primary)" };
	let flipDurationMs = 100;
	let dropFromOthersDisabled = $derived(!formationDragStatus.enabled);

	function handleConsider(e: CustomEvent<DndEvent<Unit>>) {
		for (const item of list.items) {
			if (e.detail.info.id == item.id?.toString()) {
				if (isFormation(item)) {
					formationDragStatus.enabled = false;
				} else {
					formationDragStatus.enabled = true;
				}
			}
		}
		formation.units = e.detail.items;
	}

	function handleFinalize(e: CustomEvent<DndEvent<Unit>>) {
		formation.units = e.detail.items;
	}
</script>

<main>
	<div class="formation-header">
		<input type="text" name="formation-name" id="formation-id" bind:value={formation.name} />
		<div>
			<select name="formation-type" value={formation.type}>
				{#each formationTypes as formationType}
					<option value={formationType}>{formationType}</option>
				{/each}
			</select>
			<button
				onclick={() => {
					let remove = true;
					if (formation.units.length != 0) {
						remove = confirm("Formation is not empty and removing it will remove all units it contains. Continue?");
					}
					if(remove){
						list.remove(formation.id!);
						toastController.addToast(`${formation.name} removed from list`);
					}
				}}
				>-</button>
		</div>
	</div>
	<div class="unit-cards" use:dndzone={{ items: formation.units, dropTargetStyle, flipDurationMs, dropFromOthersDisabled }} onconsider={handleConsider} onfinalize={handleFinalize}>
		{#each formation.units as unit (unit.id)}
			<UnitCard {unit}></UnitCard>
		{/each}
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
