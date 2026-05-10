<script lang="ts">
	import { Collapsible, Popover } from "$lib/generic";
	import { List, type ListFormation } from "$lib/types/list.svelte";
	import { getFormationStats } from "$lib/utilities/formationUtilities";
	import { UnitCard, UnitCustomizationModal, EditFormationModal, FormationInfoPopover, FormationMenu, FindUnitAvailabilityModal } from "../";
	import { validateFormation } from "$lib/utilities/formationRequirementValidation.svelte";
	import PlayModal from "$lib/sharedDialogs/PlayModal.svelte";
	import { DragIndicatorIcon } from "$lib/icons";
	import { createSortable } from "@dnd-kit/svelte/sortable";
	import { createDroppable } from "@dnd-kit/svelte";

	type Props = {
		formationId: string;
		draggingFormation: boolean;
		draggingUnit: boolean;
		unitCustomizationModal?: UnitCustomizationModal;
		index: number;
		list: List;
		playModal?: PlayModal;
		isOverlay?: boolean;
	};

	let { formationId, draggingFormation, draggingUnit, unitCustomizationModal, list = $bindable(), playModal, isOverlay = false, index }: Props = $props();

	const formation = $derived(list.getFormation(formationId)!);
	let editModalOpen = $state(false);
	let availabilityModal = $state<FindUnitAvailabilityModal>();

	let open = $state(true);
	let secondaryOpen = $state(true);

	let formationStats = $derived(getFormationStats(formation, list));
	let validationResults = $derived(validateFormation(formation, list));

	const sortable = createSortable({
		get id() {
			return formation.id;
		},
		get index() {
			return index;
		},
		type: "formation",
		accept: ["formation"],
		get data() {
			return { id: formation.id };
		}
	});

	const droppablePrimary = createDroppable({
		get id() {
			return `${formation.id}p`;
		},
		accept: ["unit"],
		type: "unit-drop",
		data: { primary: true }
	});
	const droppableSecondary = $derived(createDroppable({ id: `${formation.id}s`, accept: ["unit"], type: "unit-drop", data: { primary: false } }));
</script>

<div id={`formation-${formation.id}`} class={{ "formation-card": true, "dragging-outline": sortable.isDragging && !isOverlay }} {@attach sortable.attach}>
	<div class={{ "dragging-hidden": sortable.isDragging && !isOverlay }}>
		{#if list.formations.length != 1}
			<div class="formation-header">
				<div class="drag-handles" {@attach sortable.attachHandle}>
					<DragIndicatorIcon fill="var(--text-color)" width="25" height="25" />
				</div>
				<div class="formation-header-details">
					{#if formation.id == "unassigned"}
						<p>Unassigned Units</p>
					{:else}
						<p>{formation.name}</p>
						<p class="muted">{formation.type}</p>
					{/if}
					<div class="formation-error">
						{#if formation.id != "unassigned" && !validationResults.primary.valid}
							<Popover>
								{#snippet trigger()}
									<img src="/icons/alert-outline.svg" alt="Formation errors button" class="formation-error-icon" />
								{/snippet}
								<div class="formation-error-content">
									{#each validationResults.primary.requirements.filter((req) => req.met == -1 || req.met == 0) as requirement}
										<p>• {requirement.requirement}</p>
									{/each}
								</div>
							</Popover>
						{/if}
					</div>
				</div>
				<div class="formation-header-buttons">
					<FormationInfoPopover {formationStats} />
					<FormationMenu {formation} {list} bind:editModalOpen availabilityModal={availabilityModal!} {playModal} />
					<button
						onclick={() => {
							open = !open;
						}}
						class="transparent-button expand-collapse">{open ? "collapse" : "expand"}</button
					>
				</div>
			</div>
		{/if}
		{#if !draggingFormation}
			{#if !formation.units.length}
				<div class={{ "unit-cards": true, "drop-target": droppablePrimary.isDropTarget }} {@attach droppablePrimary.attach}>
					<p class="drop-message">Drop units here to add them to this formation</p>
				</div>
			{/if}
			<Collapsible bind:open>
				<div class={{ "unit-cards": true, "dragging-unit": draggingUnit }}>
					{#each formation.units as unit, index (unit.id)}
						<UnitCard {unit} {unitCustomizationModal} {list} formation={formation.id} {index} secondary={false}></UnitCard>
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
			{#if formation.secondary}
				<div class="secondary-formation-header">
					<p>{formation.secondary.type}</p>
					<p class="muted">
						PV:
						{formation.secondary.units.reduce((total, current) => {
							return (total += list.units.find((unit) => unit.id == current.id)?.cost ?? 0);
						}, 0)}
					</p>
					<div class="formation-error">
						{#if formation.id != "unassigned" && !validationResults.secondary.valid}
							<Popover>
								{#snippet trigger()}
									<img src="/icons/alert-outline.svg" alt="Formation errors button" class="formation-error-icon" />
								{/snippet}
								<div class="formation-error-content">
									{#each validationResults.secondary.requirements.filter((req) => req.met == -1 || req.met == 0) as requirement}
										<p>• {requirement.requirement}</p>
									{/each}
								</div>
							</Popover>
						{/if}
					</div>
					<button
						onclick={() => {
							secondaryOpen = !secondaryOpen;
						}}
						class="transparent-button expand-collapse">{secondaryOpen ? "collapse" : "expand"}</button
					>
				</div>
				<Collapsible bind:open={secondaryOpen}>
					{#if !formation.secondary.units.length}
						<div class={{ "unit-cards": true, "drop-target": droppablePrimary.isDropTarget }} {@attach droppableSecondary.attach}>
							<div class="drop-message">Drop units here to add them to this formation</div>
						</div>
					{/if}
					<div class={{ "unit-cards": true, "dragging-unit": draggingUnit }}>
						{#each formation.secondary.units as unit, index (unit.id)}
							<UnitCard {unit} {unitCustomizationModal} {list} formation={formation.id} {index} secondary={true}></UnitCard>
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
			<div class="drop-message">Unit list collapsed while dragging formations</div>
		{/if}
	</div>
</div>

<EditFormationModal bind:open={editModalOpen} {formation} {list} {validationResults}></EditFormationModal>
<FindUnitAvailabilityModal bind:this={availabilityModal} {formation} {list} />

<style>
	.formation-card {
		position: relative;
		width: 100%;
		background-color: var(--surface-color);
		flex-shrink: 0;
		border: 1px solid var(--border);
	}

	.formation-header {
		padding: 4px;
		background-color: var(--background);
		display: flex;
		align-items: center;
		border: 1px solid var(--border);
	}

	.formation-header-details {
		display: grid;
		grid-template-columns: 1fr max-content max-content;
		flex: 1;

		& * {
			align-self: center;
		}

		& p {
			font-size: 0.95em;
		}
	}
	.formation-error {
		width: 20px;
	}
	.formation-error-icon {
		width: 15px;
		height: 15px;
		filter: var(--error-filter);
	}
	.formation-error-content {
		display: grid;
		grid-template-rows: max-content;
		gap: 8px;
		padding: 16px;
		border: 2px solid var(--error);
		border-radius: var(--radius);
		& p {
			color: var(--surface-color-light-text-color);
		}
	}
	.formation-header-buttons {
		display: grid;
		grid-template-columns: max-content max-content max-content;
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
	.dragging-unit {
		padding: 8px 2px;
		gap: 8px;
	}
	.secondary-formation-header {
		display: grid;
		grid-template-columns: 1fr max-content max-content max-content;
		gap: 12px;
		padding: 2px 16px;
		background-color: var(--background);
		align-items: center;
		width: 100%;
		border: 1px solid var(--border);
		font-size: 0.9em;
	}

	.drop-message {
		padding: 4px;
		align-self: center;
		justify-self: center;
	}
	.drag-handles {
		display: flex;
		align-items: center;
		justify-items: center;
		padding: 0px 2px;
	}
	.drag-handles:hover {
		cursor: grab;
	}
	.expand-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 30px;
		& img {
			filter: var(--primary-filter);
		}
	}
	.dragging-hidden {
		visibility: hidden;
	}
	.dragging-outline,
	.drop-target {
		background-color: hsl(from var(--primary) h s l / 30%);
		border: 1px solid var(--primary);
	}
</style>
