<script lang="ts">
	import { List } from "../../types/list.svelte";
	import { getRules } from "$lib/types/options";
	import type { SublistStats, SublistV2 } from "../../types/sublist";
	import EditSublistModal from "./EditSublistModal.svelte";
	import ExportSublistModal from "./ExportSublistModal.svelte";

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

<main>
	<div class="space-between">
		<div class="center gap8">
			<select id={`scenario${sublist.id}`} bind:value={sublist.scenario}>
				{#each ["-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
					<option value={scenario}>{scenario}</option>
				{/each}
			</select>
			<button onclick={() => list.copySublist(sublist.id)}>Copy</button>
			<button onclick={() => editSublistModal?.show(sublist.id)}>Edit</button>
		</div>
		<div class="center gap8">
			<button
				onclick={() => {
					exportSublistModal?.show(sublist.id);
				}}>Print/Export</button
			>
			<button onclick={() => list.deleteSublist(sublist.id)}>Delete</button>
		</div>
	</div>
	<div class="sublist-units-horizontal gap8">
		<div>{unitString}</div>
	</div>
	<div class="inline gap8">
		<div>PV: {`${stats.pv ?? 0}`}{sublistMaxPv ? `/${sublistMaxPv}` : ""}</div>
		<div>Units: {`${sublist.checked?.length ?? 0}`}{sublistMaxUnits ? `/${sublistMaxUnits}` : ""}</div>
		<div>Total Health: {stats.health ?? 0}</div>
		<div>Total Short: {stats.short ?? 0}</div>
		<div>Total Medium: {stats.medium ?? 0}</div>
		<div>Total Long: {stats.long ?? 0}</div>
		<div>Avg. Size: {stats.size ?? 0}</div>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		background-color: var(--card);
		color: var(--card-foreground);
		border: 1px solid var(--border);
		padding: 8px;
		gap: 16px;
		height: 100%;
		width: 100%;
	}
	.sublist-units-horizontal {
		display: flex;
		flex-wrap: wrap;
	}
</style>
