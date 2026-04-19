<script lang="ts">
	import { getBFSPacks, getBfsById } from "$lib/data/battlefieldSupport";
	import { Dialog } from "$lib/generic";
	import { getRulesByName } from "$lib/rules/rulesets";
	import { toastController } from "$lib/stores";
	import Toast from "$lib/ui/Toast.svelte";
	import type { ValidationBFSData } from "../types";

	type Props = {
		bfsIndex: number;
		bfsData: ValidationBFSData[];
		selectedRules: string;
		fixedBfs: { fixed: ValidationBFSData; original: ValidationBFSData }[];
	};

	let { bfsIndex, bfsData = $bindable([]), selectedRules, fixedBfs = $bindable([]) }: Props = $props();

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
	let count = $derived(bfsData[bfsIndex].count ?? 1);

	function editBfs() {
		if (selectedBfsDetails) {
			const newBfs = {
				id: selectedBfs,
				name: selectedBfsDetails.name,
				count: count,
				available: true
			};
			fixedBfs.push({
				fixed: newBfs,
				original: bfsData[bfsIndex]
			});
			bfsData[bfsIndex] = newBfs;

			open = false;
		}
	}
</script>

<Dialog title="Edit Battlefield Support" bind:open>
	{#snippet trigger()}
		Edit
	{/snippet}
	<div class="add-bfs-dialog-body">
		<p>Parsed BFS Name:</p>
		<p>{bfsData[bfsIndex].name}</p>
		<p>Parsed BFS Count:</p>
		<p>{bfsData[bfsIndex].count}</p>
		<p>Replace With:</p>
		<div></div>
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
		<button onclick={editBfs}>Edit</button>
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
