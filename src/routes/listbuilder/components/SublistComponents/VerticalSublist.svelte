<script lang="ts">
	import type { List } from "../../types/list.svelte";
	import { getRules } from "$lib/types/options";
	import type { SublistV2 } from "../../types/sublist";
	import EditSublistModal from "./EditSublistModal.svelte";

	type componentProps = {
		sublist: SublistV2;
		list: List;
	};

	const { sublist = $bindable(), list }: componentProps = $props();

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

	let showEditSublistModal = $state(false);
</script>

<main>
	<div class="space-between">
		<select id={`scenario${sublist.id}`} bind:value={sublist.scenario}>
			{#each ["-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
				<option value={scenario}>{scenario}</option>
			{/each}
		</select>
		<button
			onclick={() => {
				showEditSublistModal = true;
			}}>Edit</button
		>
	</div>
	<div class="sublist-body">
		<div class="unit-container">
			{#each sublist.checked as unitId}
				<div>{list.getUnit(unitId)?.baseUnit.name}</div>
				<div>{list.getUnit(unitId)?.skill}</div>
			{/each}
		</div>
	</div>
	<div class="sublist-stats">
		<p>PV:</p>
		<p class:error={sublistMaxPv && stats.pv > sublistMaxPv}>{`${stats.pv ?? 0}`}{sublistMaxPv ? `/${sublistMaxPv}` : ``}</p>
		<p>Units:</p>
		<p class:error={sublistMaxUnits && sublist.checked?.length > sublistMaxUnits}>{`${sublist.checked?.length ?? 0}`}{sublistMaxUnits ? `/${sublistMaxUnits}` : ``}</p>
		<p>Total Health:</p>
		<p>{stats.health ?? 0}</p>
		<p>Total Short:</p>
		<p>{stats.short ?? 0}</p>
		<p>Total Medium:</p>
		<p>{stats.medium ?? 0}</p>
		<p>Total Long:</p>
		<p>{stats.long ?? 0}</p>
		<p>Total Size:</p>
		<p>{stats.size ?? 0}</p>
	</div>
	<div class="space-between">
		<button
			onclick={() => {
				// sublist.print();
			}}>Print Sublist</button
		>
		<button onclick={() => list.copySublist(sublist.id)}>Copy</button>
		<button onclick={() => list.deleteSublist(sublist.id)}>Delete</button>
	</div>
</main>

<EditSublistModal bind:showEditSublistModal {sublist} {list} pv={stats.pv}></EditSublistModal>

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
	.sublist-body {
		flex: 1;
		overflow: auto;
	}
	.unit-container {
		div {
			border-bottom: 1px solid var(--border);
			padding: 4px 0px;
		}
		padding: 0px 0px;
		display: grid;
		grid-template-columns: auto max-content;
		row-gap: 4px;
	}
	.sublist-stats {
		display: grid;
		grid-template-columns: max-content 1fr;
		flex-direction: column;
		justify-content: end;
		column-gap: 16px;
		row-gap: 4px;
	}
	.sublist-stats > p:nth-child(odd) {
		text-align: end;
	}
	.error {
		color: var(--error);
	}
</style>
