<script lang="ts">
	import { goto } from "$app/navigation";
	import { Popover } from "$lib/generic";
	import { DragIndicatorIcon } from "$lib/icons";
	import type { List, ListFormation } from "$lib/types/list.svelte";
	import { getFormationStats } from "$lib/utilities/formationUtilities";
	import { move } from "@dnd-kit/helpers";
	import { DragDropProvider, DragOverlay } from "@dnd-kit/svelte";
	import { createSortable } from "@dnd-kit/svelte/sortable";

	let { list = $bindable() }: { list: List } = $props();

	let snapshot: ListFormation[] = [];
	let popoverOpen = $state(false);
	function onDragStart() {
		snapshot = list.formations.slice();
	}

	function onDragOver(event: any) {
		list.formations = move(list.formations, event);
	}

	function onDragEnd(event: any) {
		if (event.canceled) list.formations = snapshot;
	}

	function handleAddButton() {
		const newFormationId = list.addFormation();
		goto(`#formation-${newFormationId}`);
	}
</script>

<Popover triggerClasses="button" bind:open={popoverOpen}>
	{#snippet trigger()}
		Formations
	{/snippet}
	<DragDropProvider {onDragEnd} {onDragOver} {onDragStart}>
		<div class="popover-body">
			<div class="formation-container">
				<div class="formation-header">
					<div></div>
					<p>Name</p>
					<p>Type</p>
					<p>Units</p>
					<p>PV</p>
				</div>
				{#each list.formations as formation, index}
					{@const stats = getFormationStats(formation, list)}
					{@const sortable = createSortable({
						id: formation.id,
						get index() {
							return index;
						},
						data: { name: formation.name, type: formation.type, unitCount: stats.unitCount, totalPV: stats.totalPV }
					})}
					<div class="formation-row" {@attach sortable.attach}>
						<div class="drag-handle" {@attach sortable.attachHandle}>
							<DragIndicatorIcon height="15" width="15" fill="var(--text-color)" />
						</div>
						<a href={`#formation-${formation.id}`} onclick={() => (popoverOpen = false)}>{formation.name}</a>
						<p class="muted">{formation.type}</p>
						<p class="muted">{stats.unitCount}</p>
						<p class="muted">{stats.totalPV}</p>
					</div>
				{/each}
			</div>
			<div class="popover-footer">
				<p>Click on a formation to scroll to it</p>
				<button class="button" onclick={handleAddButton}>Add</button>
			</div>
		</div>
		<DragOverlay>
			{#snippet children(source: any)}
				<div class="overlay-row">
					<div class="drag-handle">
						<DragIndicatorIcon height="15" width="15" fill="var(--text-color)" />
					</div>
					<p>{source.data.name}</p>
					<p class="muted">{source.data.type}</p>
					<p class="muted">{source.data.unitCount}</p>
					<p class="muted">{source.data.totalPV}</p>
				</div>
			{/snippet}
		</DragOverlay>
	</DragDropProvider>
</Popover>

<style>
	.popover-body {
		background-color: var(--background);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 4px;
	}
	.formation-container {
		max-height: 50dvh;
		overflow-y: auto;
		display: grid;
		grid-template-columns: max-content 1fr repeat(3, max-content);
	}
	.formation-header {
		padding: 4px;
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 5;
		gap: 16px;
		border-bottom: 1px solid var(--border);
	}
	.formation-header p {
		justify-self: center;
	}
	.formation-row {
		padding: 4px;
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 5;
		gap: 16px;
	}
	.overlay-row {
		padding: 4px;
		display: grid;
		grid-template-columns: max-content 1fr repeat(3, max-content);
		gap: 16px;
		background-color: var(--background);
		border: 1px solid var(--primary);
		border-radius: var(--radius);
	}
	.formation-row p:not(:nth-child(1)) {
		justify-self: center;
	}
	.formation-row:nth-child(even) {
		background-color: var(--surface-color);
	}
	.drag-handle:hover {
		cursor: grab;
	}
	.popover-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px;
		margin-top: 8px;
		border-top: 1px solid var(--border);
	}
	.popover-footer p {
		font-size: 0.9em;
	}
</style>
