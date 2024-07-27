<script lang="ts">
	import type { Sublist } from "$lib/types/Sublist.svelte";

	type componentProps = {
		sublist: Sublist;
		editSublist: any;
		deleteSublist: any;
		copySublist: any;
	};

	const { sublist = $bindable(), editSublist, deleteSublist, copySublist }: componentProps = $props();

	let unitString = $derived.by(() => {
		return sublist.unitList
			.map((unit) => {
				return `${unit.name} (${unit.skill})`;
			})
			.join(", ");
	});
</script>

<main>
	<div class="space-between">
		<div class="center gap8">
			<select id={`scenario${sublist.id}`} bind:value={sublist.scenario}>
				{#each ["-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
					<option value={scenario}>{scenario}</option>
				{/each}
			</select>
			<button onclick={() => copySublist(sublist.id)}>Copy</button>
			<button onclick={() => editSublist(sublist.id)}>Edit</button>
		</div>
		<div class="center gap8">
			<button
				onclick={() => {
					sublist.print();
				}}>Print Sublist</button
			>
			<button onclick={() => deleteSublist(sublist.id)}>Delete</button>
		</div>
	</div>
	<div class="sublist-units-horizontal gap8">
		<div>{unitString}</div>
	</div>
	<div class="inline gap8">
		<div>PV: {`${sublist.stats?.pv ?? 0}/250`}</div>
		<div>Units: {`${sublist.checked?.length ?? 0}/10`}</div>
		<div>Total Health: {sublist.stats?.health ?? 0}</div>
		<div>Total Short: {sublist.stats?.short ?? 0}</div>
		<div>Total Medium: {sublist.stats?.medium ?? 0}</div>
		<div>Total Long: {sublist.stats?.long ?? 0}</div>
		<div>Avg. Size: {sublist.stats?.size ?? 0}</div>
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
