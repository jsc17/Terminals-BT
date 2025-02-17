<script lang="ts">
	import type { List } from "../../types/list.svelte";
	import type { SublistV2 } from "../../types/sublist";
	import { getRules } from "$lib/types/options";
	import EditSublistModal from "./EditSublistModal.svelte";
	import ExportSublistModal from "./ExportSublistModal.svelte";

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
</script>

<main>
	<div class="space-between">
		<select id={`scenario${sublist.id}`} bind:value={sublist.scenario}>
			{#each ["-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
				<option value={scenario}>{scenario}</option>
			{/each}
		</select>
		<button onclick={() => list.copySublist(sublist.id)}>Copy</button>
		<button onclick={() => editSublistModal?.show(sublist.id)}>Edit</button>
	</div>
	<div class="sublist-units-mobile">
		<div>{unitString ?? ""}</div>
	</div>
	<div class="center gap8">
		<button
			onclick={() => {
				exportSublistModal?.show(sublist.id);
			}}>Print/Export</button
		>
		<button onclick={() => list.deleteSublist(sublist.id)}>Delete</button>
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
</style>
