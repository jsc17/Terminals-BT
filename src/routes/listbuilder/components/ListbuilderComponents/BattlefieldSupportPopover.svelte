<script lang="ts">
	import { battlefieldSupport, battlefieldSupportGroups, getBSCbyId } from "$lib/data/battlefieldSupport";
	import { Popover, Select } from "$lib/generic";
	import { TrashIcon } from "$lib/icons";
	import type { List } from "$lib/types/list.svelte";
	import type { Item } from "$lib/generic/types";

	let { list = $bindable() }: { list: List } = $props();

	let popoverOpen = $state(false);
	let selectedBS = $state("");

	let groupedItems = $derived.by(() => {
		const groupedItems: { groupLabel: string; items: Item[] }[] = [];
		for (const groupLabel of battlefieldSupportGroups) {
			groupedItems.push({
				groupLabel,
				items: battlefieldSupport
					.filter((item) => item.group == groupLabel)
					.map((item) => {
						return { value: item.id.toString(), label: `${item.name} (${item.bspCost})` };
					})
			});
		}
		return groupedItems;
	});

	function handleAddButton() {
		list.addBS(Number(selectedBS));
	}
</script>

<Popover triggerClasses="button" bind:open={popoverOpen}>
	{#snippet trigger()}
		{@const bsp = list.bsList.reduce((acc, bsId) => acc + getBSCbyId(bsId)!.bspCost, 0)}
		{@const pv = list.bsList.reduce((acc, bsId) => acc + (getBSCbyId(bsId)!.pvCost ?? 0), 0)}
		BF Sup - {bsp != 0 ? bsp + " BSP" : ""}{bsp != 0 && pv != 0 ? "/" : ""}{pv != 0 ? pv + " PV" : ""}
	{/snippet}
	<div class="popover-body">
		<div class="formation-container">
			<div class="formation-header">
				<p>Name</p>
				<p>BSP</p>
				{#if list.bsList.find((bs) => getBSCbyId(bs)?.pvCost)}
					<p>PV</p>
				{:else}
					<div></div>
				{/if}
				<div></div>
			</div>
			{#each list.bsList as bsId, index}
				{@const bs = getBSCbyId(bsId)}
				{#if bs}
					<div class="formation-row">
						<p>{bs.name}</p>
						<p class="muted">{bs.bspCost}</p>
						<p class="muted">{bs.pvCost}</p>
						<button class="transparent-button" onclick={() => list.removeBS(index)}><TrashIcon height="15" width="15" fill="var(--primary)" /></button>
					</div>
				{/if}
			{/each}
		</div>
		<div class="popover-footer">
			<Select bind:value={selectedBS} {groupedItems} type="single"></Select>
			<button onclick={handleAddButton}>Add</button>
		</div>
	</div>
</Popover>

<style>
	.popover-body {
		background-color: var(--background);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 4px;
		min-width: min(250px, 90dvw);
	}
	.formation-container {
		max-height: 50dvh;
		overflow-y: auto;
		display: grid;
		grid-template-columns: 1fr repeat(3, max-content);
		margin: 8px 0px;
		row-gap: 4px;
	}
	.formation-header {
		padding: 4px;
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 5;
		gap: 16px;
		border-bottom: 1px solid var(--border);
	}
	.formation-header p {
		justify-self: center;
	}
	.formation-row {
		padding: 4px;
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 5;
		gap: 16px;
	}
	.formation-row p:not(:nth-child(1)) {
		justify-self: center;
	}
	.formation-row:nth-child(odd) {
		background-color: var(--surface-color);
	}

	.popover-footer {
		display: grid;
		grid-template-columns: 1fr max-content;
		align-items: center;
		padding: 4px;
		border-top: 1px solid var(--border);
		gap: 16px;
	}
</style>
