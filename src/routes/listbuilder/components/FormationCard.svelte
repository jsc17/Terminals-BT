<script lang="ts">
	import UnitCard from "./UnitCard.svelte";
	import { dndzone, dragHandleZone, type DndEvent, dragHandle } from "svelte-dnd-action";
	import { toastController } from "$lib/stores/toastController.svelte";
	import Menu from "$lib/components/Generic/Menu.svelte";
	import { getContext } from "svelte";
	import type { List } from "../types/list.svelte";
	import { type FormationType, type FormationV2 } from "../types/formation";
	import formationTypes from "$lib/data/formations.json" assert { type: "json" };
	import { exportToJeff } from "../utilities/export.svelte";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { Popover } from "bits-ui";
	import UnitCustomizationModal from "./UnitCustomizationModal.svelte";
	import Select from "$lib/components/Generic/Select.svelte";

	type Props = { formation: FormationV2; draggingColumns: boolean; unitCustomizationModal?: UnitCustomizationModal };

	let list: List = getContext("list");
	let { formation, draggingColumns, unitCustomizationModal }: Props = $props();

	let formationTypeList: { label: string; items: { value: string; label: string }[] }[] = formationTypes.map((group) => {
		return {
			label: group.type,
			items: group.formations.map((formation) => {
				return { value: formation.name, label: formation.name };
			})
		};
	});

	let dropTargetStyle = {};
	let flipDurationMs = 100;

	let formationStats = $derived.by(() => {
		let totalPV = 0,
			totalS = 0,
			totalM = 0,
			totalL = 0,
			totalHealth = 0,
			totalSize = 0,
			totalSkill = 0,
			unitCount = formation.units.length;

		formation.units.forEach((unit) => {
			let unitStats = list.getUnit(unit.id);
			if (unitStats) {
				totalPV += unitStats.cost ?? 0;
				totalS += unitStats.baseUnit.damageS ?? 0;
				totalM += unitStats.baseUnit.damageM ?? 0;
				totalL += unitStats.baseUnit.damageL ?? 0;
				totalHealth += unitStats.baseUnit.health ?? 0;
				totalSize += unitStats.baseUnit.size ?? 0;
				totalSkill += unitStats.skill ?? 0;
			}
		});
		let avgS = 0,
			avgM = 0,
			avgL = 0,
			avgHealth = 0,
			avgSize = 0,
			avgSkill = 0;
		if (unitCount) {
			avgS = Number((totalS / unitCount).toFixed(2));
			avgM = Number((totalM / unitCount).toFixed(2));
			avgL = Number((totalL / unitCount).toFixed(2));
			avgHealth = Number((totalHealth / unitCount).toFixed(2));
			avgSkill = Number((totalSkill / unitCount).toFixed(2));
			avgSize = Number((totalSize / unitCount).toFixed(2));
		}
		return {
			totalPV,
			unitCount,
			totalS,
			totalM,
			totalL,
			totalHealth,
			avgS,
			avgM,
			avgL,
			avgHealth,
			avgSkill,
			avgSize
		};
	});

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
	<button class="transparent-button" onclick={exportFormationToJeff}>Export Formation to Jeff's Tools </button>
{/snippet}

{#snippet infoPopover()}
	<Popover.Root>
		<Popover.Trigger class="formation-info-trigger">
			PV: {formationStats.totalPV}
			<img class="info-button-icon" src="/icons/information.svg" alt="information" />
		</Popover.Trigger>
		<Popover.Content class="formation-info-content">
			<div>Total Units:</div>
			<div>{formationStats.unitCount}</div>
			<hr class="formation-info-separator" />
			<div>Average Skill:</div>
			<div>{formationStats.avgSkill}</div>
			<div>Average Size:</div>
			<div>{formationStats.avgSize}</div>
			<div>Average Health:</div>
			<div>{formationStats.avgHealth}</div>
			<div>Average Short Damage:</div>
			<div>{formationStats.avgS}</div>
			<div>Average Medium Damage:</div>
			<div>{formationStats.avgM}</div>
			<div>Average Long Damage:</div>
			<div>{formationStats.avgL}</div>
			<hr class="formation-info-separator" />
			<div>Total Health:</div>
			<div>{formationStats.totalHealth}</div>
			<div>Total Short Damage:</div>
			<div>{formationStats.totalS}</div>
			<div>Total Medium Damage:</div>
			<div>{formationStats.totalM}</div>
			<div>Total Long Damage:</div>
			<div>{formationStats.totalL}</div>
		</Popover.Content>
	</Popover.Root>
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
				<div class="formation-name">Unassigned Units</div>
				{@render infoPopover()}
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

			<div class="select-formation-type-wrapper"><Select bind:value={formation.type} type="single" groupedItems={formationTypeList}></Select></div>

			{@render infoPopover()}
			<Menu img={"/icons/menu.svg"}>
				{@render jeffExportButton()}
				<button
					class="transparent-button"
					onclick={() => {
						if (formation.units.length == 0 || confirm("Formation is not empty and removing it will remove all units it contains. Continue?")) {
							list.removeFormation(formation.id);
							toastController.addToast(`${formation.name} removed from list`);
						}
					}}>Remove Formation</button
				>
			</Menu>
		</div>
	{/if}
	{#if !draggingColumns}
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
					<UnitCard unitId={unit.id} {unitCustomizationModal}></UnitCard>
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
					<UnitCard unitId={unit.id} {unitCustomizationModal}></UnitCard>
				{/each}
			</div>
		{/if}
	{:else}
		<div class="drop-message">Unit list collapsed while dragging formations</div>
	{/if}
</div>

<style>
	.formation-card {
		position: relative;
		width: 100%;
		background-color: var(--card);
		flex-shrink: 0;
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
		gap: 4px;
	}
	.formation-name {
		flex: 1;
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
	:global(.formation-info-trigger) {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 2px;
		background-color: transparent;
		color: var(--muted-foreground);
		width: 5.75em;
	}
	:global(.formation-info-content) {
		display: grid;
		grid-template-columns: max-content max-content;
		column-gap: 8px;
		row-gap: 2px;
		width: max-content;
		height: max-content;
		background-color: var(--background);
		border-radius: var(--radius);
		border: 1px solid var(--border);
		z-index: 5;
		padding: 16px;
	}
	:global(.formation-info-content div) {
		align-self: center;
		justify-self: flex-end;
	}
	:global(.formation-info-separator) {
		grid-column-start: 1;
		grid-column-end: 3;
		border: 1px solid var(--muted);
	}
	.variation {
		padding-left: 16px;
	}
</style>
