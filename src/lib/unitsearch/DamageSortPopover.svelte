<script lang="ts">
	import { Popover, Separator } from "bits-ui";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import type { ResultList } from "$lib/types/resultList.svelte";
	import { SortAscendingIcon, SortDescendingIcon, SortIcon } from "$lib/icons";

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
		if (includeOV) label += "+OV";

		const existingSortIndex = resultList.sortKeys.findIndex((sort) => sort.id == type);
		if (existingSortIndex != -1) {
			resultList.sortKeys[existingSortIndex] = { id: type, order, label, extra: { includeOV } };
			return;
		}
		resultList.sortKeys.push({ id: type, order, label, extra: { includeOV } });
	}

	function clearDamageSorts() {
		const damageKeys = ["damageS", "damageM", "damageL", "damageTotal", "overheat"];
		resultList.sortKeys = resultList.sortKeys.filter((k) => damageKeys.includes(k.id));
	}

	let damageSIndex = $derived(resultList.sortKeys.findIndex((sort) => sort.id == "damageS"));
	let damageMIndex = $derived(resultList.sortKeys.findIndex((sort) => sort.id == "damageM"));
	let damageLIndex = $derived(resultList.sortKeys.findIndex((sort) => sort.id == "damageL"));
	let damageTotalIndex = $derived(resultList.sortKeys.findIndex((sort) => sort.id == "damageTotal"));
	let overheatIndex = $derived(resultList.sortKeys.findIndex((sort) => sort.id == "overheat"));
</script>

<Popover.Root bind:open>
	<Popover.Trigger class={appWindow.isMobile ? "sort-header-button-mobile" : "sort-header-button"}>
		{#if appWindow.isNarrow}
			{@const firstDamageIndex = resultList.sortKeys.findIndex((sort) => sort.id == "overheat" || sort.id.slice(0, 6) == "damage")}

			<p>DMG</p>
			{#if firstDamageIndex == -1}
				<SortIcon fill="var(--surface-color-light-text-color)" width="20" height="20" />
			{:else}
				<div class="sort-header-text" data-sort-index={resultList.sortKeys.length > 1 && firstDamageIndex != -1 ? firstDamageIndex + 1 : undefined}>
					{#if resultList.sortKeys[firstDamageIndex].order == "asc"}
						<SortAscendingIcon fill="var(--primary)" width="20" height="20" />
					{:else}
						<SortDescendingIcon fill="var(--primary)" width="20" height="20" />
					{/if}
				</div>
			{/if}
		{:else}
			<div class="damage-header-text">
				<span class={{ primary: damageTotalIndex != -1 }}>DMG&nbsp;</span>
				<div class="sort-header-text" data-sort-index={resultList.sortKeys.length > 1 && damageSIndex != -1 ? damageSIndex + 1 : undefined}>
					<span class={{ primary: damageSIndex != -1 || damageTotalIndex != -1 }}>S</span>
					{#if damageSIndex != -1}
						{#if resultList.sortKeys[damageSIndex].order == "asc"}
							<SortAscendingIcon fill="var(--primary)" width="20" height="20" />
						{:else}
							<SortDescendingIcon fill="var(--primary)" width="20" height="20" />
						{/if}
					{/if}
				</div>
				/
				<div class="sort-header-text" data-sort-index={resultList.sortKeys.length > 1 && damageMIndex != -1 ? damageMIndex + 1 : undefined}>
					<span class={{ primary: damageMIndex != -1 || damageTotalIndex != -1 }}>M</span>
					{#if damageMIndex != -1}
						{#if resultList.sortKeys[damageMIndex].order == "asc"}
							<SortAscendingIcon fill="var(--primary)" width="20" height="20" />
						{:else}
							<SortDescendingIcon fill="var(--primary)" width="20" height="20" />
						{/if}
					{/if}
				</div>
				/
				<div class="sort-header-text" data-sort-index={resultList.sortKeys.length > 1 && damageLIndex != -1 ? damageLIndex + 1 : undefined}>
					<span class={{ primary: damageLIndex != -1 || damageTotalIndex != -1 }}>L</span>
					{#if damageLIndex != -1}
						{#if resultList.sortKeys[damageLIndex].order == "asc"}
							<SortAscendingIcon fill="var(--primary)" width="20" height="20" />
						{:else}
							<SortDescendingIcon fill="var(--primary)" width="20" height="20" />
						{/if}
					{/if}
				</div>
				&nbsp;-&nbsp;
				<div class="sort-header-text" data-sort-index={resultList.sortKeys.length > 1 && overheatIndex != -1 ? overheatIndex + 1 : undefined}>
					<span class={{ primary: overheatIndex != -1 }}>OV</span>
					{#if overheatIndex != -1}
						{#if resultList.sortKeys[overheatIndex].order == "asc"}
							<SortAscendingIcon fill="var(--primary)" width="20" height="20" />
						{:else}
							<SortDescendingIcon fill="var(--primary)" width="20" height="20" />
						{/if}
					{/if}
				</div>
			</div>
			{#if damageTotalIndex == -1 && damageSIndex == -1 && damageMIndex == -1 && damageLIndex == -1 && overheatIndex == -1}
				<SortIcon fill="var(--surface-color-light-text-color)" width="20" height="20" />
			{:else if damageTotalIndex != -1}
				<div class="sort-header-text" data-sort-index={resultList.sortKeys.length > 1 && damageTotalIndex != -1 ? damageTotalIndex + 1 : undefined}>
					{#if resultList.sortKeys[damageTotalIndex].order == "asc"}
						<SortAscendingIcon fill="var(--primary)" width="20" height="20" />
					{:else}
						<SortDescendingIcon fill="var(--primary)" width="20" height="20" />
					{/if}
				</div>
			{/if}
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
			<div class="space-between">
				<button onclick={clearDamageSorts}>Clear All</button>
				<button onclick={setSort}>Add</button>
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
	.damage-header-text {
		display: flex;
		align-items: center;
	}
	.sort-header-text {
		position: relative;
		display: flex;
		align-items: center;
	}
	.sort-header-text[data-sort-index] {
		margin-right: 5px;
	}
	.sort-header-text::after {
		content: attr(data-sort-index);
		position: absolute;
		right: -4px;
		top: 0px;
		color: var(--primary);
		font-size: 0.6rem;
	}
</style>
