<script lang="ts">
	import { toastController } from "$lib/stores";
	import { List, type ListFormation } from "$lib/types/list.svelte";
	import { sendListToPlay } from "$lib/playmode/playmode";
	import { exportToJeff } from "../../utilities/export.svelte";
	import FindUnitAvailabilityModal from "../modals/FindUnitAvailabilityModal.svelte";
	import { DropdownMenu } from "$lib/generic";
	import type { MenuItem } from "$lib/generic/types";

	type Props = {
		formation: ListFormation;
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

	const dropdownItems = $derived.by(() => {
		const items: MenuItem[] = [];
		if (formation.id != "unassigned") {
			items.push({ type: "item", label: "Edit Formation", onSelect: () => (editModalOpen = true) });
		}
		items.push({ type: "item", label: "Check Formation Availability", onSelect: availabilityModal.show });
		items.push({ type: "separator", classes: "muted" });
		items.push({ type: "item", label: "Play Formation", onSelect: () => sendListToPlay(list.details.name, [formation], list.units) });
		items.push({ type: "item", label: "Export Formation", onSelect: exportFormationToJeff });
		items.push({ type: "separator", classes: "muted" });
		items.push({ type: "item", label: "Clear Formation", onSelect: clearFormation });
		items.push({ type: "item", label: "Remove Formation", onSelect: removeFormation });

		return items;
	});
</script>

<DropdownMenu items={dropdownItems}>
	{#snippet trigger()}
		<img class="menu-image" src="/icons/menu.svg" alt="menu" />
	{/snippet}
</DropdownMenu>

<style>
	.menu-image {
		width: 15px;
		height: 15px;
	}
</style>
