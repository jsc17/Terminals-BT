<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { enhance } from "$app/forms";
	import { type ActionResult } from "@sveltejs/kit";
	import { ResultList } from "$lib/types/resultList.svelte";
	import type { List } from "$lib/types/list.svelte";
	import DamageSortPopover from "./DamageSortPopover.svelte";
	import { eraLookup } from "$lib/data/erasFactionLookup";
	import { createAbilityLineString } from "$lib/utilities/abilityUtilities";
	import { Dialog, Separator, DropdownMenu } from "$lib/generic";
	import { exportArrayToCSV } from "$lib/utilities/export";
	import VirtualList from "@humanspeak/svelte-virtual-list";
	import { GearSix } from "phosphor-svelte";

	type Props = {
		list?: List;
		resultList: ResultList;
	};

	let { list = $bindable(), resultList = $bindable() }: Props = $props();

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

	let availabilityDialogOpen = $state(false);
	let availabilityResults = $state<{ era: string; factionList: string[] }[]>([]);

	function sort(key: string) {
		if (resultList.sort.key != key) {
			resultList.sort.key = key;
			resultList.sort.order = "asc";
		} else {
			if (resultList.sort.order == "asc") {
				resultList.sort.order = "des";
			} else {
				resultList.sort.key = "";
			}
		}
	}
	async function showAvailability() {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type == "success") {
				const order = [...eraLookup].map(([key, value]) => {
					return value;
				});
				availabilityResults = result.data?.unitAvailability
					.sort((a: any, b: any) => {
						return order.indexOf(a.era) - order.indexOf(b.era);
					})
					.map((list: { era: string; factionList: string[] }) => {
						return { era: list.era, factionList: list.factionList.sort() };
					});
				availabilityDialogOpen = true;
			}
		};
	}
</script>

<div class="search-results card">
	{#if list && list.rules != "noRes"}
		<p class="rules-notice">Some units may be filtered out due to the selected ruleset</p>
	{/if}
	<div class:result-list-header={!appWindow.isMobile} class:result-list-header-mobile={appWindow.isMobile}>
		<div class:sort-header-button={!appWindow.isMobile} class:sort-header-button-mobile={appWindow.isMobile}>
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
					<GearSix weight="fill" size="20" />
				{/snippet}
			</DropdownMenu>
		</div>
		<button class:sort-header-button={!appWindow.isMobile} class:sort-header-button-mobile={appWindow.isMobile} onclick={() => sort("name")} bind:clientWidth={listWidth}>
			{appWindow.isNarrow ? `Name` : `Name - ${resultList.filteredList.length}/${resultList.restrictedList.length} results shown`}
			{#if resultList.sort.key == "name"}
				<img class="sort-selected button-icon" src={resultList.sort.order == "asc" ? "/icons/sort-ascending.svg" : "/icons/sort-descending.svg"} alt="sort" />
			{:else}
				<img class="sort button-icon" src="/icons/sort.svg" alt="sort" />
			{/if}
		</button>
		{#each headers as header}
			<button class:sort-header-button={!appWindow.isMobile} class:sort-header-button-mobile={appWindow.isMobile} onclick={() => sort(header.key)}>
				{header.label}
				{#if resultList.sort.key == header.key}
					<img class="sort-selected button-icon" src={resultList.sort.order == "asc" ? "/icons/sort-ascending.svg" : "/icons/sort-descending.svg"} alt="sort" />
				{:else}
					<img class="sort button-icon" src="/icons/sort.svg" alt="sort" />
				{/if}
			</button>
		{/each}
		<DamageSortPopover {resultList}></DamageSortPopover>
	</div>
	{#await resultList.status}
		<div class="loading-message">Loading units. Please wait ...</div>
	{:then result}
		{#if result == "No Units Found"}
			<p class="loading-message">No Units found for the selected Era and Faction Combination.</p>
		{:else}
			<div class="virtual-list-container" bind:clientHeight={listHeight}>
				<svelte:boundary>
					{#snippet failed(error, reset)}
						<p>
							Sorry about this, but something failed. Press the button below to reset the result list. If this happens repeatedly, please take a screenshot and create an issue on
							my <a href="https://github.com/jsc17/Terminals-BT/issues" target="_blank">Github</a>
						</p>

						<button onclick={reset}>Reset</button>

						<p>{error}</p>
					{/snippet}
					<VirtualList items={resultList.filteredList ?? []}>
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
									<a class="unit-name" href="http://masterunitlist.info/Unit/Details/{item.mulId}" target="_blank">{item.name ?? "Not found"}</a>
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
										<form method="post" action="/?/getUnitAvailability" use:enhance={showAvailability} class="align-center">
											<input type="hidden" name="mulId" value={item.mulId ?? 0} />
											<button class="availability-button">Availability</button>
										</form>
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
			<p>{result.factionList.join(", ")}</p>
			<div class="availability-separator-container">
				<Separator classes={"separator-border"} />
			</div>
		{/each}
	</div>
</Dialog>

<style>
	.search-results {
		display: flex;
		flex-direction: column;
		flex: 1;
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
		height: 30px;
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
		background-color: var(--surface-color);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-color);
		height: 100%;
		width: 100%;
		gap: 4px;
		border: 1px solid var(--border);
		border-radius: 0%;
	}
	:global(.sort-header-button-mobile) {
		display: flex;
		flex-direction: column;
		gap: 0px;
	}
	:global(.sort-header-button-mobile img) {
		width: 10px;
		height: 10px;
	}

	:global(.sort) {
		filter: var(--surface-color-light-filter);
	}
	:global(.sort-selected) {
		filter: var(--primary-filter);
	}
	.virtual-list-row {
		display: grid;
		height: 100%;
		width: 100%;
		grid-template-columns: 5% 1fr repeat(5, 7%) 12% 15%;
		grid-template-rows: 1fr 1fr;
		overflow-x: hidden;
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
	}
	.availability-result-container {
		padding: 16px;
		row-gap: 8px;
		column-gap: 24px;
		display: grid;
		grid-template-columns: max-content 1fr;
		max-height: 90dvh;
		overflow: auto;
	}
	.availability-result-era {
		display: flex;
		justify-content: end;
		color: var(--primary);
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
	.rules-notice {
		align-self: center;
		justify-self: center;
		margin-bottom: 4px;
	}
</style>
