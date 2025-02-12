<script lang="ts">
	import type { List } from "../../types/list.svelte";
	import type { SublistV2 } from "../../types/sublist";
	import { getRules } from "$lib/types/options";
	import EditSublistModal from "./EditSublistModal.svelte";

	type componentProps = {
		sublist: SublistV2;
		list: List;
	};

	const { sublist = $bindable(), list }: componentProps = $props();

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

	let showEditSublistModal = $state(false);
</script>

<main>
	<div class="space-between">
		<select id={`scenario${sublist.id}`} bind:value={sublist.scenario}>
			{#each ["-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
				<option value={scenario}>{scenario}</option>
			{/each}
		</select>
		<button onclick={() => list.copySublist(sublist.id)}>Copy</button>
		<button onclick={() => (showEditSublistModal = true)}>Edit</button>
	</div>
	<div class="sublist-units-mobile">
		<div>{unitString ?? ""}</div>
	</div>
	<div class="center gap8">
		<button
			onclick={() => {
				// sublist.print();
			}}>Print Sublist</button
		>
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
</style>
