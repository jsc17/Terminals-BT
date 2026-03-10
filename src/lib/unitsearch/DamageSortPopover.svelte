<script lang="ts">
	import { Popover, Separator } from "bits-ui";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import type { ResultList } from "$lib/types/resultList.svelte";

	type Props = {
		resultList: ResultList;
	};

	let { resultList }: Props = $props();

	let open = $state(false);
	let order = $state<"asc" | "desc">("asc");
	let type = $state<"damageS" | "damageM" | "damageL" | "damageTotal" | "overheat">("damageS");
	let includeOV = $state(false);

	function setSort() {
		open = false;
		let label = "Damage ";
		if (type == "damageTotal") label += "Total";
		else if (type == "overheat") label += "OV";
		else label += type.slice(-1);
		if (includeOV) label += " + OV";

		const existingSortIndex = resultList.sortKeys.findIndex((sort) => sort.key == "damage" && sort.extra?.type == type);
		if (existingSortIndex != -1) {
			resultList.sortKeys[existingSortIndex] = { key: "damage", order, label, extra: { type, includeOV } };
			return;
		}
		resultList.sortKeys.push({ key: "damage", order, label, extra: { type, includeOV } });
	}

	let damageSIndex = $derived(resultList.sortKeys.findIndex((sort) => sort.key == "damage" && sort.extra?.type == "damageS"));
	let damageMIndex = $derived(resultList.sortKeys.findIndex((sort) => sort.key == "damage" && sort.extra?.type == "damageM"));
	let damageLIndex = $derived(resultList.sortKeys.findIndex((sort) => sort.key == "damage" && sort.extra?.type == "damageL"));
	let damageTotalIndex = $derived(resultList.sortKeys.findIndex((sort) => sort.key == "damage" && sort.extra?.type == "damageTotal"));
	let overheatIndex = $derived(resultList.sortKeys.findIndex((sort) => sort.key == "damage" && sort.extra?.type == "overheat"));
</script>

<Popover.Root bind:open>
	<Popover.Trigger class={appWindow.isMobile ? "sort-header-button-mobile" : "sort-header-button"}>
		{#if appWindow.isNarrow}
			<p>DMG</p>
		{:else}
			<p class="center">
				<span class:span-highlight={damageTotalIndex != -1}>DMG</span>
				<span class:span-highlight={damageSIndex != -1}>S</span>{#if damageSIndex != -1}
					<img class="sort-selected button-icon" src={resultList.sortKeys[damageSIndex].order == "asc" ? "/icons/sort-ascending.svg" : "/icons/sort-descending.svg"} alt="sort" />
				{/if}
				/<span class:span-highlight={damageMIndex != -1}>M</span>{#if damageMIndex != -1}
					<img class="sort-selected button-icon" src={resultList.sortKeys[damageMIndex].order == "asc" ? "/icons/sort-ascending.svg" : "/icons/sort-descending.svg"} alt="sort" />
				{/if}
				/<span class:span-highlight={damageLIndex != -1}>L</span>{#if damageLIndex != -1}
					<img class="sort-selected button-icon" src={resultList.sortKeys[damageLIndex].order == "asc" ? "/icons/sort-ascending.svg" : "/icons/sort-descending.svg"} alt="sort" />
				{/if}
				-
				<span class:span-highlight={overheatIndex != -1}
					>OV{#if overheatIndex != -1}
						<img
							class="sort-selected button-icon"
							src={resultList.sortKeys[overheatIndex].order == "asc" ? "/icons/sort-ascending.svg" : "/icons/sort-descending.svg"}
							alt="sort"
						/>
					{/if}</span
				>
			</p>
		{/if}
		{#if damageTotalIndex == -1 && damageSIndex == -1 && damageMIndex == -1 && damageLIndex == -1 && overheatIndex == -1}
			<img class="sort button-icon" src="/icons/sort.svg" alt="sort" />
		{/if}
	</Popover.Trigger>
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
			<button onclick={setSort}>Add Damage Sort</button>
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
