<script lang="ts">
	import { battlefieldSupport, battlefieldSupportGroups, getBFSPacks, getBfsById } from "$lib/data/battlefieldSupport";
	import { Popover, Select } from "$lib/generic";
	import { TrashIcon } from "$lib/icons";
	import type { List } from "$lib/types/list.svelte";
	import type { Item } from "$lib/generic/types";
	import { getRulesByName } from "$lib/rules/rulesets";

	let { list = $bindable() }: { list: List } = $props();

	let popoverOpen = $state(false);

	let groupedItems = $derived.by(() => {
		const groupedItems: { groupLabel: string; items: { value: number; label: string }[] }[] = [];

		const availableBFS = getBFSPacks(getRulesByName(list.rules)?.bfs?.allowedPacks ?? []);

		for (const [group, values] of availableBFS) {
			groupedItems.push({
				groupLabel: group,
				items: values
					.filter((item) => !list.bsList.has(item.id))
					.map((item) => {
						return { value: item.id, label: `${item.name}` };
					})
			});
		}
		return groupedItems;
	});

	let selectedBS = $derived(groupedItems.find((g) => g.items.find((i) => i.value != -1))?.items.find((i) => i.value != -1)?.value ?? -1);

	function handleAddButton() {
		if (selectedBS != -1) {
			list.addBS(selectedBS);
		}
	}

	const bsCount = $derived(list.bsList.size);
	const hasBSP = $derived(list.bsList.keys().some((bs) => (getBfsById(bs)?.bspCost ?? 0) != 0));
	const hasPV = $derived(list.bsList.keys().some((bs) => (getBfsById(bs)?.pvCost ?? 0) != 0));
</script>

<Popover triggerClasses="button" bind:open={popoverOpen}>
	{#snippet trigger()}
		{#if bsCount == 0}
			Battlefield Support
		{:else}
			{@const bsp = list.bsList.entries().reduce((acc, [id, count]) => acc + (getBfsById(id)?.bspCost ?? 0) * count, 0)}
			{@const pv = list.bsList.entries().reduce((acc, [id, count]) => acc + (getBfsById(id)?.pvCost ?? 0) * count, 0)}
			BF Sup - {bsp != 0 ? bsp + " BSP" : ""}{bsp != 0 && pv != 0 ? "/" : ""}{pv != 0 ? pv + " PV" : ""}
		{/if}
	{/snippet}
	<div class="popover-body">
		<div class="formation-container">
			<div class="formation-header">
				<div></div>
				<p>Name</p>
				{#if hasBSP}
					<p>BSP</p>
				{:else}
					<div></div>
				{/if}
				{#if hasPV}
					<p>PV</p>
				{:else}
					<div></div>
				{/if}
				<div></div>
			</div>
			{#each list.bsList.entries() as [id, count]}
				{@const bsData = getBfsById(id)}
				{#if bsData}
					<div class="formation-row">
						<input type="number" min="1" bind:value={() => list.bsList.get(id), (v) => list.setBSCount(id, v ?? 1)} />
						<p class={{ error: (await list.issues).issueBFS.has(id) }}>{bsData.name}</p>
						{#if bsData.bspCost}
							<p class="muted">{bsData.bspCost}({count * bsData.bspCost})</p>
						{:else}
							<div></div>
						{/if}
						{#if bsData.pvCost}
							<p class="muted">{bsData.pvCost}({count * bsData.pvCost})</p>
						{:else}
							<div></div>
						{/if}
						<button class="transparent-button" onclick={() => list.removeBS(id)}><TrashIcon height="15" width="15" fill="var(--primary)" /></button>
					</div>
				{/if}
			{:else}
				<div class="formation-row">
					<p class="muted">None selected</p>
				</div>
			{/each}
		</div>
		<div class="popover-footer">
			<select bind:value={selectedBS}>
				{#each groupedItems as group}
					<optgroup label={group.groupLabel} class="muted">
						{#each group.items as item}
							<option value={item.value}>{item.label}</option>
						{:else}
							<option value={-1} class="muted">No options remaining</option>
						{/each}
					</optgroup>
				{/each}
			</select>
			<button onclick={handleAddButton} disabled={selectedBS == -1}>Add</button>
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
		grid-template-columns: max-content 1fr repeat(3, max-content);
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
	input[type="number"] {
		width: 50px;
	}
</style>
