<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { ResultList } from "$lib/types/resultList.svelte";
	import type { List } from "$lib/types/list.svelte";
	import DamageSortPopover from "./DamageSortPopover.svelte";
	import { eraLookup, factionLookup } from "$lib/data/erasFactionLookup";
	import { createAbilityLineString } from "$lib/utilities/abilityUtilities";
	import { Dialog, Separator, DropdownMenu } from "$lib/generic";
	import { exportArrayToCSV } from "$lib/utilities/export";
	import VirtualList from "@humanspeak/svelte-virtual-list";
	import { getUnitAvailabilityLocal } from "$lib/local/sqllite/local-db";
	import { getContext } from "svelte";

	import { DragDropProvider, DragOverlay } from "@dnd-kit/svelte";
	import { createSortable } from "@dnd-kit/svelte/sortable";
	import { move } from "@dnd-kit/helpers";

	import { GearIcon, SortIcon, SortAscendingIcon, SortDescendingIcon, DragIndicatorIcon, TrashIcon, AlertIcon } from "$lib/icons";
	import SortTag from "./SortTag.svelte";

	type Props = {
		list?: List;
		resultList: ResultList;
	};

	let { list = $bindable(), resultList = $bindable() }: Props = $props();
	let workerInitialized = getContext<Promise<void>>("workerInitialized");

	let headers = $derived(
		appWindow.isMobile
			? [
					{ label: "Type", key: "subtype" },
					{ label: "PV", key: "pv" },
					{ label: "Move", key: "move" },
					{ label: "Health", key: "health" }
				]
			: [
					{ label: "Type", key: "subtype" },
					{ label: "PV", key: "pv" },
					{ label: "Size", key: "size" },
					{ label: "Move", key: "move" },
					{ label: "TMM", key: "tmm" },
					{ label: appWindow.isNarrow ? "Health" : "Health (A+S)", key: "health" }
				]
	);

	let listHeight = $state(500);
	let listWidth = $state(0);
	let draggingSortTag = $state(false);
	let sortKeys = $derived(resultList.sortKeys);

	let availabilityDialogOpen = $state(false);
	let availabilityResults = $state<{ era: string; factions: string[] }[]>([]);

	function sort({ key, label }: { key: string; label: string }) {
		const sortKeyIndex = resultList.getSortKeyIndex(key);
		if (sortKeyIndex != -1) {
			if (resultList.sortKeys[sortKeyIndex].order == "asc") {
				resultList.sortKeys[sortKeyIndex].order = "desc";
			} else {
				resultList.sortKeys.splice(sortKeyIndex, 1);
			}
		} else {
			resultList.sortKeys.push({ id: key, label, order: "asc" });
		}
	}
	async function showAvailability(id: number) {
		const results = await getUnitAvailabilityLocal(id);
		if (!results) return;
		availabilityResults = results.map((e) => {
			return {
				era: eraLookup.get(e.era) ?? `Unknown Era ${e.era}`,
				factions: e.factions.map((f) => factionLookup.get(f) ?? `Unknown Faction ${f}`).sort((a, b) => a.localeCompare(b))
			};
		});
		availabilityDialogOpen = true;
	}

	function onDragStart() {
		draggingSortTag = true;
	}
	function onDragOver(event: any) {
		const { source } = event.operation;
		if (source?.sortable) {
			sortKeys = move(sortKeys, event);
		}
	}
	function onDragEnd(event: any) {
		if (event.canceled) return;
		const { source } = event.operation;

		if (source?.sortable) {
			resultList.sortKeys = sortKeys;
		}
		draggingSortTag = false;
	}
</script>

<div class="search-results card">
	<div class="search-results-multisort-tags">
		{#if resultList.sortKeys.length > 1}
			<DragDropProvider {onDragStart} {onDragOver} {onDragEnd}>
				<div class="multisort-draggable-container">
					{#each sortKeys as sortKey, index (sortKey.id)}
						<SortTag id={sortKey.id} {index} label={sortKey.label} order={sortKey.order} isOverlay={false} {resultList} />
					{/each}
					<div class="spacer"></div>
				</div>

				<DragOverlay>
					{#snippet children(source: any)}
						<SortTag id={source.data.id} index={source.data.index} label={source.data.label} order={source.data.order} isOverlay={true} {resultList} />
					{/snippet}
				</DragOverlay>
			</DragDropProvider>
			<button onclick={() => (resultList.sortKeys = [])} class="clear-sort-button">Clear All</button>
		{/if}
	</div>
	<div class:result-list-header={!appWindow.isMobile} class:result-list-header-mobile={appWindow.isMobile}>
		<div
			class={{
				"sort-header-button": !appWindow.isMobile,
				"sort-header-button-mobile": appWindow.isMobile
			}}
		>
			<DropdownMenu
				items={[
					{
						type: "item",
						label: "Export currently filtered results to CSV",
						onSelect: () => {
							exportArrayToCSV(resultList.filteredList);
						}
					}
				]}
				triggerClasses="transparent-button"
			>
				{#snippet trigger()}
					<GearIcon fill="var(--primary)" width="20" height="20" />
				{/snippet}
			</DropdownMenu>
		</div>
		<button
			class={{
				"sort-header-button": !appWindow.isMobile,
				"sort-header-button-mobile": appWindow.isMobile
			}}
			onclick={() => sort({ key: "name", label: "Name" })}
			bind:clientWidth={listWidth}
		>
			{appWindow.isNarrow ? `Name` : `Name - ${resultList.filteredList.length}/${resultList.restrictedList.length} results shown`}
			{#if resultList.getSortKeyIndex("name") != -1}
				{@const sortKey = resultList.sortKeys[resultList.getSortKeyIndex("name")]}
				<div
					class="sort-header-superscript"
					data-sort-index={resultList.sortKeys.length > 1 && resultList.getSortKeyIndex("name") != -1 ? resultList.getSortKeyIndex("name") + 1 : undefined}
				>
					{#if sortKey.order == "asc"}
						<SortAscendingIcon fill="var(--primary)" width="20" height="20" />
					{:else}
						<SortDescendingIcon fill="var(--primary)" width="20" height="20" />
					{/if}
				</div>
			{:else}
				<SortIcon fill="var(--surface-color-light-text-color)" width="20" height="20" />
			{/if}
		</button>
		{#each headers as header}
			{@const sortKeyIndex = resultList.getSortKeyIndex(header.key)}
			<button
				class={{
					"sort-header-button": !appWindow.isMobile,
					"sort-header-button-mobile": appWindow.isMobile
				}}
				onclick={() => sort({ key: header.key, label: header.label })}
			>
				{header.label}
				{#if sortKeyIndex != -1}
					<div class="center sort-header-superscript" data-sort-index={resultList.sortKeys.length > 1 && sortKeyIndex != -1 ? sortKeyIndex + 1 : undefined}>
						{#if resultList.sortKeys[sortKeyIndex].order == "asc"}
							<SortAscendingIcon fill="var(--primary)" width="20" height="20" />
						{:else}
							<SortDescendingIcon fill="var(--primary)" width="20" height="20" />
						{/if}
					</div>
				{:else}
					<SortIcon fill="var(--surface-color-light-text-color)" width="20" height="20" />
				{/if}
			</button>
		{/each}
		<DamageSortPopover {resultList}></DamageSortPopover>
	</div>
	{#if resultList.options?.notice}
		<div class="rules-notice">
			<p class="muted">{resultList.options.notice}</p>
		</div>
	{/if}
	{#await Promise.all([workerInitialized, resultList.status])}
		<div class="loading-message">Loading units. Please wait ...</div>
	{:then [_, result]}
		{#if result == "No Units Found"}
			<p class="loading-message">No Units found for the selected Era and Faction Combination.</p>
		{:else}
			<div class="virtual-list-container" bind:clientHeight={listHeight}>
				<svelte:boundary>
					{#snippet failed(error, reset)}
						<div>
							<p>
								Sorry about this, but something failed. Press the button below to reset the result list. If this happens repeatedly, please take a screenshot and create an issue on
								my <a href="https://github.com/jsc17/Terminals-BT/issues" target="_blank">Github</a>
							</p>
							<button onclick={reset}>Reset</button>
							<p>{error}</p>
						</div>
					{/snippet}
					<VirtualList items={resultList.sortedList ?? []}>
						{#snippet renderItem(item)}
							<div class={{ "virtual-list-row": !appWindow.isMobile, "virtual-list-row-mobile": appWindow.isMobile }}>
								{#if item}
									{#if list}
										<div class="align-center add-button">
											<button onclick={() => list.addUnit(item)}>+</button>
										</div>
									{:else}
										<div></div>
									{/if}
									<div class="inline">
										<a class={{ "unit-name": true }} href="http://masterunitlist.info/Unit/Details/{item.mulId}" target="_blank">
											{const key = $derived((item.group?.length ? item.group : item.class) + item.subtype)}
											{#if resultList.tagFilter?.maximumBehavior == "warn" && (!resultList.collectionUnits.has(key) || resultList.warnList.has(key))}
												<AlertIcon fill="var(--warning)" height="15" />
											{/if}
											{item.name ?? "Not found"}</a
										>
									</div>
									<div class="align-center">{item.subtype ?? "-"}</div>
									<div class="align-center">{item.pv ?? "-"}</div>
									{#if !appWindow.isMobile}
										<div class="align-center">{item?.size ?? "-"}</div>
									{/if}
									<div class="align-center">
										{#if item?.move == undefined}
											-
										{:else}
											{#each item.move as movement, index}
												{#if index != 0}
													{"/ "}
												{/if}
												{`${movement.speed}"${movement.type ?? ""}`}
											{/each}
										{/if}
									</div>
									{#if !appWindow.isMobile}
										<div class="align-center">{item.tmm ?? "-"}</div>
									{/if}
									<div class="align-center">
										{#if item.health == undefined}
											-
										{:else}
											{appWindow.isMobile ? item.health : item.health + " (" + item.armor + "+" + item.structure + ")"}
										{/if}
									</div>
									<div class="align-center">
										{#if item.damageS == undefined}
											-
										{:else}
											{item.damageS}{item.damageSMin ? "*" : ""}{"/" + item.damageM}{item.damageMMin ? "*" : ""}{"/" + item.damageL}{item.damageLMin ? "*" : ""}{" - " +
												item.overheat}
										{/if}
									</div>
									<div class="search-result-stat-row">
										<div class:abilities={!appWindow.isMobile} class:abilities-mobile={appWindow.isMobile}>
											<p>{createAbilityLineString(item.abilities ?? [])}</p>
										</div>
										<p class="role-text">Role: <span class="muted">{item.role}</span></p>
										<button class="availability-button" onclick={() => showAvailability(item.id)}>Availability</button>
									</div>
								{:else}
									<p>Unit didn't load correctly. You should probably never see this message. If you do, refresh the page</p>
								{/if}
							</div>
						{/snippet}
					</VirtualList>
				</svelte:boundary>
			</div>
		{/if}
	{:catch}
		<div>
			<p class="loading-message">Failed to load units. Please wait a moment, and try again</p>
			<button
				onclick={() => {
					resultList.loadResults([], []);
				}}>Reload</button
			>
		</div>
	{/await}
</div>

<Dialog title="Unit Availability" triggerClasses="transparent-button" bind:open={availabilityDialogOpen}>
	<div class="availability-result-container">
		{#each availabilityResults as result}
			<p class="availability-result-era">{result.era}:</p>
			<p>{result.factions.join(", ")}</p>

			<div class="availability-separator-container">
				<Separator classes={"separator-border"} />
			</div>
		{:else}
			<p style="grid-column: span 2;">Unit is not available in any Era to any Faction</p>
		{/each}
	</div>
</Dialog>

<style>
	.search-results {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.multisort-draggable-container {
		display: flex;
		gap: 8px;
		row-gap: 12px;
		align-items: center;
		flex-wrap: wrap;
	}
	.spacer {
		flex: 1;
	}
	.search-results-multisort-tags {
		display: flex;
		align-items: center;
		margin-bottom: 4px;
		padding: var(--responsive-padding);
	}

	.clear-sort-button {
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		min-height: 20px;
		height: max-content;
		padding: 0px 8px;
		background-color: var(--error);
		align-self: flex-end;
		justify-self: flex-end;
	}
	.result-list-header {
		display: grid;
		grid-template-columns: 5% 1fr repeat(5, 7%) 12% 15%;
		height: 25px;
		overflow: hidden;
		scrollbar-gutter: stable;
	}
	.result-list-header-mobile {
		display: grid;
		grid-template-columns: 25px 1fr repeat(4, 10%) 15%;
	}
	.virtual-list-container {
		width: 100%;
		display: flex;
		position: relative;
		flex: 1;
		background-color: var(--surface-color);
	}
	.loading-message {
		padding-top: 24px;
		padding-left: 24px;
		width: 100%;
		display: flex;
		font-size: x-large;
	}
	:global(.sort-header-button, .sort-header-button-mobile) {
		background-color: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-color);
		height: 100%;
		width: 100%;
		gap: 4px;
		border: 1px solid var(--border);
		border-radius: 0%;
		box-shadow: unset;
	}
	:global(.sort-header-button-mobile) {
		display: flex;
		flex-direction: column;
		gap: 0px;
	}
	.sort-header-superscript {
		position: relative;
	}
	.sort-header-superscript::after {
		content: attr(data-sort-index);
		position: absolute;
		right: -4px;
		top: 0px;
		color: var(--primary);
		font-size: 0.6rem;
	}
	:global(.sort) {
		filter: var(--surface-color-light-filter);
	}
	.rules-notice {
		padding: 4px;
		border-left: 1px solid var(--border);
		scrollbar-gutter: stable;
	}
	.rules-notice p {
		text-align: center;
	}
	.virtual-list-row {
		display: grid;
		height: 100%;
		width: 100%;
		grid-template-columns: 5% 1fr repeat(5, 7%) 12% 15%;
		grid-template-rows: 1fr 1fr;
		padding-top: 4px;
		border-bottom: 1px solid var(--border);
		border-left: 1px solid var(--border);
	}
	.virtual-list-row-mobile {
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-columns: 25px 1fr repeat(4, 10%) 15%;
		border-bottom: 1px solid var(--border);
	}
	:global(.virtual-list-items > div:nth-child(even)) {
		background-color: var(--table-secondary);
	}
	.search-result-stat-row {
		display: grid;
		grid-template-columns: 1fr max-content max-content;
		grid-column: 2 / -1;
	}
	.align-center {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.add-button {
		grid-row-start: 1;
		grid-row-end: 3;
	}
	.unit-name {
		padding-left: 8px;
		align-self: center;
	}
	.abilities {
		padding-left: 16px;
		font-size: 0.75rem;
		display: flex;
		align-items: center;
	}
	.abilities-mobile {
		padding-left: 16px;
		font-size: 0.75rem;
		display: flex;
		align-items: center;
	}
	.availability-button {
		padding: 4px 16px;
		background-color: transparent;
		color: var(--primary);
		border-radius: 3px;
		box-shadow: none;
	}
	.availability-result-container {
		padding: 16px;
		max-height: 80dvh;
		row-gap: 8px;
		column-gap: 24px;
		display: grid;
		grid-template-columns: fit-content(40%) 1fr;
		grid-auto-rows: max-content;
		overflow: auto;
	}
	.availability-result-era {
		justify-self: end;
		color: var(--primary);
		text-align: end;
	}
	.availability-separator-container {
		display: flex;
		align-items: center;
		justify-content: center;
		grid-column: span 2;
	}
	@supports (-webkit-touch-callout: none) {
		.availability-result-container {
			overflow: scroll;
		}
	}
	.role-text {
		font-size: 0.8em;
		align-self: center;
	}
</style>
