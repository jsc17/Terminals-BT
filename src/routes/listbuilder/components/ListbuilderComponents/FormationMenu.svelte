<script lang="ts">
	import { Popover, Separator } from "$lib/global/components";
	import Dropdown from "$lib/global/components/Dropdown.svelte";
	import { toastController } from "$lib/global/stores";
	import { List, sendListToPlay, type FormationV2 } from "$lib/types";
	import { DropdownMenu } from "bits-ui";
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

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<img class="menu-image" src="/icons/menu.svg" alt="menu" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content>
			{#if formation.id != "unassigned"}
				<DropdownMenu.Item
					class="dropdown-button"
					textValue="Edit Formation"
					onSelect={() => {
						editModalOpen = true;
					}}
				>
					Edit Formation
				</DropdownMenu.Item>
			{/if}
			<DropdownMenu.Item
				class="dropdown-button"
				textValue="Check Formation Availability"
				onSelect={() => {
					availabilityModal.show();
				}}
			>
				Check Formation Availability
			</DropdownMenu.Item>
			<DropdownMenu.Separator class="muted" />
			<DropdownMenu.Item
				class="dropdown-button"
				textValue="Play Formation"
				onSelect={() => {
					sendListToPlay([formation], list.units);
				}}
			>
				Play Formation
			</DropdownMenu.Item>
			<DropdownMenu.Item class="dropdown-button" textValue="Export Formation to Jeff" onSelect={exportFormationToJeff}>Export Formation to Jeff's Tools</DropdownMenu.Item>
			<DropdownMenu.Separator class="muted" />
			<DropdownMenu.Item class="dropdown-button" textValue="Clear Formation" onSelect={clearFormation}>Clear Formation</DropdownMenu.Item>
			{#if formation.id != "unassigned"}
				<DropdownMenu.Item class="dropdown-button" textValue="Remove Formation" onSelect={removeFormation}>Remove Formation</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
	.menu-image {
		width: 15px;
		height: 15px;
	}
</style>
