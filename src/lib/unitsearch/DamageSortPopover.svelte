<script lang="ts">
	import { Popover, Separator } from "bits-ui";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import type { ResultList } from "$lib/types/resultList.svelte";

	type Props = {
		resultList: ResultList;
	};

	let { resultList }: Props = $props();

	let open = $state(false);
	let order = $state("asc");
	let type = $state("damageS");
	let includeOV = $state(false);

	function clearSort() {
		open = false;
		resultList.sort = { key: "", order: "asc", extra: "" };
	}

	function setSort() {
		open = false;
		resultList.sort = { key: "damage", order, extra: { type, includeOV } };
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger class={appWindow.isMobile ? "sort-header-button-mobile" : "sort-header-button"}>
		{#if appWindow.isNarrow}
			<p>DMG</p>
		{:else}
			<p>
				<span class:span-highlight={resultList.sort.extra?.type == "damageTotal"}>DMG</span>
				<span class:span-highlight={resultList.sort.extra?.type == "damageS" || resultList.sort.extra?.type == "damageTotal"}>S</span>/<span
					class:span-highlight={resultList.sort.extra?.type == "damageM" || resultList.sort.extra?.type == "damageTotal"}>M</span
				>/<span class:span-highlight={resultList.sort.extra?.type == "damageL" || resultList.sort.extra?.type == "damageTotal"}>L</span> -
				<span class:span-highlight={resultList.sort.extra?.type == "overheat" || resultList.sort.extra?.includeOV}>OV</span>
			</p>
		{/if}
		{#if resultList.sort.key == "damage"}
			<img class="sort-selected button-icon" src={resultList.sort.order == "asc" ? "/icons/sort-ascending.svg" : "/icons/sort-descending.svg"} alt="sort" />
		{:else}
			<img class="sort button-icon" src="/icons/sort.svg" alt="sort" />
		{/if}</Popover.Trigger
	>
	<Popover.Content class="damage-sort-content">
		<div class="damage-sort-content-container">
			<label
				>Sort by:
				<select name="damage-sort-type" id="damage-sort-type" bind:value={type}>
					<option value="damageS">Short</option>
					<option value="damageM">Medium</option>
					<option value="damageL">Long</option>
					<option value="damageTotal">Total</option>
					<option value="overheat">Overheat</option>
				</select>
			</label>
			<label
				>Order:
				<select bind:value={order}>
					<option value="asc">Ascending</option>
					<option value="desc">Descending</option>
				</select>
			</label>
			<label><input type="checkbox" name="damage-sort-include-ov" id="damage-sort-include-ov" bind:checked={includeOV} /> Include Overheat</label>
			<Separator.Root decorative={true} class="muted-separator" />
			<div class="space-between">
				<button onclick={clearSort}>Clear</button>
				<button onclick={setSort}>Sort</button>
			</div>
		</div>
	</Popover.Content>
</Popover.Root>

<style>
	:global(.damage-sort-content) {
		z-index: 5;
		padding: 16px;
		background-color: var(--background);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
	:global(.damage-sort-content-container) {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	:global(.span-highlight) {
		color: var(--primary);
	}
</style>
