<script lang="ts">
	import { Dialog, Select } from "$lib/global/components/";
	import type { List } from "$lib/types";
	import { battlefieldSupport, battlefieldSupportGroups } from "$lib/data/battlefieldSupport";
	import type { Item } from "$lib/global/types/types";

	type Props = {
		list: List;
	};

	let { list = $bindable() }: Props = $props();
	let open = $state(false);
	let selectedBS = $state("");

	export function show() {
		open = true;
	}

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

	function handleAddBs() {
		list.addBS(Number(selectedBS));
	}
</script>

<Dialog title="Add Battlefield Support" bind:open>
	{#snippet description()}
		<p class="muted">Add's Battlefield support cards from Alpha Strike: Commanders edition (pg.54)</p>
	{/snippet}
	<div class="flex-between">
		<Select bind:value={selectedBS} {groupedItems} type="single"></Select>
		<button onclick={handleAddBs}>Add</button>
	</div>
</Dialog>

<style>
	.flex-between {
		gap: 8px;
	}
	.muted {
		font-size: 0.9em;
	}
</style>
