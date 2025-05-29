<script lang="ts">
	import type { List } from "../../../../lib/types/list.svelte";
	import type { SublistStats, SublistV2 } from "../../types/sublist";
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
		stats: SublistStats;
		sublistMaxPv?: number;
		sublistMaxUnits?: number;
		unitString: string;
	};

	const { sublist = $bindable(), list, editSublistModal, exportSublistModal, stats, sublistMaxPv, sublistMaxUnits, unitString }: componentProps = $props();
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
