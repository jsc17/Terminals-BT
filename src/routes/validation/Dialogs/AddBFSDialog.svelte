<script lang="ts">
	import { getBFSPacks, getBfsById } from "$lib/data/battlefieldSupport";
	import { Dialog } from "$lib/generic";
	import { getRulesByName } from "$lib/rules/rulesets";
	import { toastController } from "$lib/stores";
	import type { ValidationBFSData } from "../types";

	type Props = {
		bfsData: ValidationBFSData[];
		selectedRules: string;
		addedBfs: ValidationBFSData[];
	};

	let { bfsData = $bindable(), selectedRules, addedBfs = $bindable() }: Props = $props();

	let open = $state(false);

	let rulesDetails = $derived(getRulesByName(selectedRules));
	let groupedItems = $derived.by(() => {
		const groupedItems: { groupLabel: string; items: { value: number; label: string }[] }[] = [];

		const availableBFS = getBFSPacks(rulesDetails?.bfs?.allowedPacks ?? []);

		for (const [group, values] of availableBFS) {
			groupedItems.push({
				groupLabel: group,
				items: values
					.filter((item) => !bfsData.some((bfs) => bfs.id == item.id))
					.map((item) => {
						return { value: item.id, label: `${item.name}` };
					})
			});
		}
		return groupedItems;
	});
	let selectedBfs = $derived<number>(groupedItems.at(0)?.items.at(0)?.value ?? -1);
	let selectedBfsDetails = $derived(selectedBfs != undefined ? getBfsById(selectedBfs) : undefined);
	let count = $state(1);

	function addBfs() {
		if (bfsData.find((bfs) => bfs.id == selectedBfs)) toastController.addToast("This Battlefield Support has already exists in the list");
		else {
			bfsData.push({
				id: selectedBfs,
				count: count,
				name: selectedBfsDetails?.name ?? "",
				bsp: selectedBfsDetails?.bspCost ?? 0,
				pv: selectedBfsDetails?.pvCost ?? 0,
				available: true
			});
			addedBfs.push(bfsData[bfsData.length - 1]);
			open = false;
		}
	}
</script>

<Dialog title="Add Battlefield Support" bind:open>
	{#snippet trigger()}
		Add Battlefield Support
	{/snippet}
	<div class="add-bfs-dialog-body">
		<select bind:value={selectedBfs}>
			{#each groupedItems as group}
				<optgroup label={group.groupLabel} class="muted">
					{#each group.items as item}
						<option value={item.value}>{item.label}</option>
					{:else}
						<option value={-1}>No Battlefield Support options available</option>
					{/each}
				</optgroup>
			{/each}
		</select>
		<input type="number" bind:value={count} />
		<p>BSP: {selectedBfsDetails?.bspCost ?? 0}</p>
		<p>Total BSP: {(selectedBfsDetails?.bspCost ?? 0) * count}</p>
		<p>PV: {selectedBfsDetails?.pvCost ?? 0}</p>
		<p>Total PV: {(selectedBfsDetails?.pvCost ?? 0) * count}</p>
		<div></div>
		<button onclick={addBfs} disabled={selectedBfs == -1}>Add</button>
	</div>
</Dialog>

<style>
	.add-bfs-dialog-body {
		display: grid;
		grid-template-columns: max-content max-content;
		gap: 12px;
		align-items: center;
		justify-content: center;
	}

	p:nth-child(odd) {
		text-align: right;
	}
</style>
