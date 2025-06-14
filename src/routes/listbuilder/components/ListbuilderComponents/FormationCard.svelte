<script lang="ts">
	import { dndzone, dragHandleZone, type DndEvent, dragHandle } from "svelte-dnd-action";
	import { getContext } from "svelte";
	import { appWindow } from "$lib/global/stores";
	import { Collapsible } from "$lib/global/components/";
	import { List, type FormationV2 } from "$lib/types/";
	import { getFormationStats } from "$lib/utilities/formation-utilities";
	import { UnitCard, UnitCustomizationModal, EditFormationModal, FormationInfoPopover, FormationMenu } from "../";

	type Props = { formation: FormationV2; draggingColumns: boolean; unitCustomizationModal?: UnitCustomizationModal };

	let { formation = $bindable(), draggingColumns, unitCustomizationModal }: Props = $props();
	let list: List = getContext("list");
	let editModalOpen = $state(false);

	let flipDurationMs = 100;
	let open = $state(true);
	let secondaryOpen = $state(true);

	let formationStats = $derived(getFormationStats(formation, list));

	function handleSort(e: CustomEvent<DndEvent<{ id: string }>>) {
		formation.units = e.detail.items;
	}
	function handleSecondarySort(e: CustomEvent<DndEvent<{ id: string }>>) {
		formation.secondary!.units = e.detail.items;
	}
</script>

<div class="formation-card">
	{#if formation.id == "unassigned"}
		{#if list.formations.length != 1}
			<div class="formation-header">
				{#if appWindow.isMobile}
					<div class="drag-handles" use:dragHandle>
						<img class="combobox-img" src="/icons/chevron-updown.svg" alt="expand list chevrons" />
					</div>
				{/if}
				<div class="formation-header-details">Unassigned Units</div>
				<div class="formation-header-buttons">
					<FormationInfoPopover {formationStats} />
					<FormationMenu {formation} {list} bind:editModalOpen />
					<button
						onclick={() => {
							open = !open;
						}}
						class="transparent-button expand-collapse">{open ? "collapse" : "expand"}</button
					>
				</div>
			</div>
		{/if}
	{:else}
		<div class="formation-header">
			{#if appWindow.isMobile}
				<div class="drag-handles" use:dragHandle>
					<img class="combobox-img" src="/icons/chevron-updown.svg" alt="Drag handle chevrons" />
				</div>
			{/if}
			<div class="formation-header-details">
				<p>{formation.name}</p>
				<p class="muted">{formation.type}</p>
			</div>
			<div class="formation-header-buttons">
				<FormationInfoPopover {formationStats} />
				<FormationMenu {formation} {list} bind:editModalOpen />
				<button
					onclick={() => {
						open = !open;
					}}
					class="transparent-button expand-collapse">{open ? "collapse" : "expand"}</button
				>
			</div>
		</div>
	{/if}
	{#if !draggingColumns}
		{#if !formation.units.length}
			<div class="drop-message">Drop units here to add them to this formation</div>
		{/if}
		{#if appWindow.isMobile}
			<Collapsible bind:open>
				<div
					class="unit-cards"
					use:dragHandleZone={{ items: formation.units, dropTargetClasses: ["droppable"], flipDurationMs, type: "units" }}
					onconsider={handleSort}
					onfinalize={handleSort}
				>
					{#each formation.units as unit (unit.id)}
						<UnitCard unitId={unit.id} {unitCustomizationModal}></UnitCard>
					{/each}
				</div>
			</Collapsible>
			{#if !open}
				<button
					class="transparent-button expand-button"
					onclick={() => {
						open = true;
					}}>Expand collapsed formation <img src="/icons/expand.svg" alt="Expand formation" /></button
				>
			{/if}
			{#if formation.secondary && !draggingColumns}
				<div class="secondary-formation-header">
					{formation.secondary.type}
					<button
						onclick={() => {
							secondaryOpen = !secondaryOpen;
						}}
						class="transparent-button expand-collapse">{secondaryOpen ? "collapse" : "expand"}</button
					>
				</div>
				<Collapsible bind:open={secondaryOpen}>
					{#if !formation.secondary.units.length}
						<div class="drop-message">Drop units here to add them to this sub-formation</div>
					{/if}
					<div
						class="unit-cards"
						use:dragHandleZone={{ items: formation.secondary.units, dropTargetClasses: ["droppable"], flipDurationMs, type: "units" }}
						onconsider={handleSecondarySort}
						onfinalize={handleSecondarySort}
					>
						{#each formation.secondary.units as unit (unit.id)}
							<UnitCard unitId={unit.id} {unitCustomizationModal}></UnitCard>
						{/each}
					</div>
				</Collapsible>
				{#if !secondaryOpen}
					<button
						class="transparent-button expand-button"
						onclick={() => {
							secondaryOpen = true;
						}}>Expand collapsed formation <img src="/icons/expand.svg" alt="Expand formation" /></button
					>
				{/if}
			{/if}
		{:else}
			<Collapsible bind:open>
				<div
					class="unit-cards"
					use:dndzone={{ items: formation.units, dropTargetClasses: ["droppable"], flipDurationMs, type: "units" }}
					onconsider={handleSort}
					onfinalize={handleSort}
				>
					{#each formation.units as unit (unit.id)}
						<UnitCard unitId={unit.id} {unitCustomizationModal}></UnitCard>
					{/each}
				</div>
			</Collapsible>
			{#if !open}
				<button
					class="transparent-button expand-button"
					onclick={() => {
						open = true;
					}}>Expand collapsed formation <img src="/icons/expand.svg" alt="Expand formation" /></button
				>
			{/if}
			{#if formation.secondary && !draggingColumns}
				<div class="secondary-formation-header">
					{`${formation.name} ${formation.secondary.type}`}
					<button
						onclick={() => {
							secondaryOpen = !secondaryOpen;
						}}
						class="transparent-button expand-collapse">{secondaryOpen ? "collapse" : "expand"}</button
					>
				</div>
				<Collapsible bind:open={secondaryOpen}>
					{#if !formation.secondary.units.length}
						<div class="drop-message">Drop units here to add them to this sub-formation</div>
					{/if}
					<div
						class="unit-cards"
						use:dndzone={{ items: formation.secondary.units, dropTargetClasses: ["droppable"], flipDurationMs, type: "units" }}
						onconsider={handleSecondarySort}
						onfinalize={handleSecondarySort}
					>
						{#each formation.secondary.units as unit (unit.id)}
							<UnitCard unitId={unit.id} {unitCustomizationModal}></UnitCard>
						{/each}
					</div>
				</Collapsible>
				{#if !secondaryOpen}
					<button
						class="transparent-button expand-button"
						onclick={() => {
							secondaryOpen = true;
						}}>Expand collapsed formation <img src="/icons/expand.svg" alt="Expand formation" /></button
					>
				{/if}
			{/if}
		{/if}
	{:else}
		<div class="drop-message">Unit list collapsed while dragging formations</div>
	{/if}
</div>

<EditFormationModal bind:open={editModalOpen} {formation}></EditFormationModal>

<style>
	.formation-card {
		position: relative;
		width: 100%;
		background-color: var(--card);
		flex-shrink: 0;
		border: 1px solid var(--border);
	}
	.formation-card:hover {
		cursor: row-resize;
	}
	.formation-header {
		padding: 4px;
		background-color: var(--background);
		display: flex;
		align-items: center;
		border: 1px solid var(--border);
		gap: 16px;
	}
	.formation-header-details {
		display: flex;
		flex: 1;
		justify-content: space-between;
		align-items: center;

		p {
			font-size: 0.95em;
		}
	}

	.formation-header-buttons {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.unit-cards {
		width: 100%;
		padding: 2px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.secondary-formation-header {
		display: flex;
		padding: 2px 16px;
		background-color: var(--background-light);
		align-items: center;
		justify-content: space-between;
		width: 100%;
		border: 1px solid var(--border);
		font-size: 0.9em;
	}
	:global(.droppable) {
		outline: 2px solid var(--primary);
		min-height: 2em;
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
	.expand-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 30px;
		img {
			filter: var(--primary-filter);
		}
	}
</style>
