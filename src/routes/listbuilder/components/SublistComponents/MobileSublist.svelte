<script lang="ts">
	import type { List } from "../../types/list.svelte";
	import type { SublistV2 } from "../../types/sublist";
	import { getRules } from "$lib/types/options";
	import EditSublistModal from "./EditSublistModal.svelte";
	import ExportSublistModal from "./ExportSublistModal.svelte";
	import { dragHandle } from "svelte-dnd-action";
	import Menu from "$lib/components/Generic/Menu.svelte";

	type componentProps = {
		sublist: SublistV2;
		list: List;
		editSublistModal: EditSublistModal | undefined;
		exportSublistModal: ExportSublistModal | undefined;
	};

	const { sublist = $bindable(), list, editSublistModal, exportSublistModal }: componentProps = $props();

	let unitString = $derived.by(() => {
		return sublist.checked
			.map((unitId) => {
				return `${list.getUnit(unitId)?.baseUnit.name} (${list.getUnit(unitId)?.skill})`;
			})
			.join(", ");
	});

	let stats = $derived.by(() => {
		let pv = 0,
			health = 0,
			short = 0,
			medium = 0,
			long = 0,
			size = 0;
		for (const unitId of sublist.checked) {
			const unit = list.getUnit(unitId);
			pv += unit?.cost ?? 0;
			health += unit?.baseUnit.health ?? 0;
			medium += unit?.baseUnit.damageM ?? 0;
			short += unit?.baseUnit.damageS ?? 0;
			long += unit?.baseUnit.damageL ?? 0;
			size += unit?.baseUnit.size ?? 0;
		}
		return { pv, health, short, medium, long, size };
	});

	let sublistMaxPv = $derived(getRules(list.rules)?.sublistMaxPv);
	let sublistMaxUnits = $derived(getRules(list.rules)?.sublistMaxUnits);
</script>

<div class="mobile-sublist">
	<div class="mobile-sublist-drag-handle" use:dragHandle>
		<img class="combobox-img" src="/icons/chevron-updown.svg" alt="expand list chevrons" />
	</div>
	<div class="mobile-sublist-body">
		<div class="space-between">
			<select id={`scenario${sublist.id}`} bind:value={sublist.scenario}>
				{#each ["-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
					<option value={scenario}>{scenario}</option>
				{/each}
			</select>

			<div>
				<div class="mobile-sublist-stats">PV: {`${stats.pv ?? 0}`}{sublistMaxPv ? `/${sublistMaxPv}` : ""}</div>
				<div class="mobile-sublist-stats">Units: {`${sublist.checked?.length ?? 0}`}{sublistMaxUnits ? `/${sublistMaxUnits}` : ""}</div>
			</div>
			<Menu img={"/icons/menu.svg"}>
				<button onclick={() => list.copySublist(sublist.id)}>Copy</button>
				<button onclick={() => editSublistModal?.show(sublist.id)}>Edit</button>
				<button
					onclick={() => {
						exportSublistModal?.show(sublist.id);
					}}>Print/Export</button
				>
				<button onclick={() => list.deleteSublist(sublist.id)}>Delete</button>
			</Menu>
		</div>
		<div class="sublist-units-mobile">
			{unitString ?? ""}
		</div>
	</div>
</div>

<style>
	.mobile-sublist {
		display: grid;
		grid-template-columns: 1.5em 1fr;
		background-color: var(--card);
		color: var(--card-foreground);
		border: 1px solid var(--border);
	}
	.mobile-sublist-drag-handle {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.mobile-sublist-body {
		display: flex;
		flex-direction: column;
		padding: 4px;
		gap: 4px;
	}
	.mobile-sublist-stats {
		color: var(--muted-foreground);
	}
</style>
