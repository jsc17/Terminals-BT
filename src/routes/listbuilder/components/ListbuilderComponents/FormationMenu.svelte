<script lang="ts">
	import { Popover, Separator } from "$lib/global/components";
	import { toastController } from "$lib/global/stores";
	import { List, sendListToPlay, type FormationV2 } from "$lib/types";
	import { exportToJeff } from "../../utilities/export.svelte";
	import FindUnitAvailabilityModal from "../modals/FindUnitAvailabilityModal.svelte";

	type Props = {
		formation: FormationV2;
		list: List;
		editModalOpen: boolean;
		availabilityModal: FindUnitAvailabilityModal;
	};

	let { formation, list, editModalOpen = $bindable(false), availabilityModal }: Props = $props();

	function exportFormationToJeff() {
		if (formation.units.length == 0) {
			toastController.addToast("Formation is empty");
		} else {
			const units = formation.units.map((unitId) => list.getUnit(unitId.id)!);
			exportToJeff(formation.name, units);
		}
	}
	function clearFormation() {
		if (formation.units.length == 0 || confirm("Clear the formation and remove it's units from the list?")) {
			for (const unit of formation.units) {
				list.removeUnit(unit.id);
			}
		}
	}
	function removeFormation() {
		if (formation.units.length == 0 || confirm("Formation is not empty and removing it will remove all units it contains. Continue?")) {
			list.removeFormation(formation.id);
			toastController.addToast(`${formation.name} removed from list`);
		}
	}
</script>

<Popover>
	{#snippet trigger()}
		<div class="formation-menu-trigger"><img src="/icons/menu.svg" alt="menu" /></div>
	{/snippet}
	<div class="formation-menu-container">
		{#if formation.id != "unassigned"}
			<button
				class="transparent-button"
				onclick={() => {
					editModalOpen = true;
				}}>Edit Formation</button
			>
		{/if}
		<button
			class="transparent-button"
			onclick={() => {
				availabilityModal.show();
			}}>Check Formation Availability</button
		>
		<Separator />
		<button
			class="transparent-button"
			onclick={() => {
				sendListToPlay([formation], list.units);
			}}>Play Formation</button
		>
		<button class="transparent-button" onclick={exportFormationToJeff}>Export Formation to Jeff's Tools </button>
		<Separator />
		<button class="transparent-button" onclick={clearFormation}>Clear Formation</button>
		{#if formation.id != "unassigned"}
			<button class="transparent-button" onclick={removeFormation}>Remove Formation</button>
		{/if}
	</div>
</Popover>

<style>
	.formation-menu-trigger {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		background-color: var(--primary);
		padding: 0px 16px;
		border-radius: var(--radius);

		& img {
			width: 15px;
			height: 15px;
		}
	}
	.formation-menu-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
	}
</style>
