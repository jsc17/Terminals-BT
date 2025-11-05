<script lang="ts">
	import { onMount, setContext } from "svelte";
	import { Listbuilder } from "./index";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { SearchFilters, SearchParameters, SearchResults } from "$lib/unitsearch";
	import { List } from "$lib/types/list.svelte";
	import { watch } from "runed";
	import { innerWidth } from "svelte/reactivity/window";
	import { eraLookup, factionLookup } from "$lib/data/erasFactionLookup";

	type Props = {
		list: List;
		listCloseCallback: (id: string) => void;
	};

	let { list, listCloseCallback }: Props = $props();

	let resultList = $state<ResultList>(new ResultList());
	setContext("list", list);

	let showResultList = $state(true);
	let showListbuilder = $state(false);
	let showEraFaction = $state(false);
	let showFilters = $state(false);

	watch([() => list.details.eras, () => list.details.factions, () => list.details.general], () => {
		resultList.loadResults(list.details.eras, list.details.factions, list.details.general);
	});

	onMount(() => {
		resultList.setOptions(list.rules);
	});

	$inspect(showEraFaction, showFilters, showListbuilder);
</script>

<main>
	{#if innerWidth.current && innerWidth.current >= 1000}
		<div class="search">
			<SearchParameters bind:list bind:resultList />
			<SearchFilters bind:resultList />
			<SearchResults bind:list bind:resultList />
		</div>
		<Listbuilder {listCloseCallback} bind:resultList bind:list />
	{:else}
		<div class={{ "result-list-wrapper": showResultList, hidden: !showResultList }}><SearchResults bind:list bind:resultList /></div>
		<div class={{ hidden: !showEraFaction, "list-button-opened": showEraFaction }}><SearchParameters bind:list bind:resultList /></div>
		<div class={{ hidden: !showFilters, "list-button-opened": showFilters }}><SearchFilters bind:resultList /></div>
		<div class={{ "list-drawer-wrapper": true, hidden: !showListbuilder, "list-button-opened": showListbuilder }}>
			<Listbuilder {listCloseCallback} bind:resultList bind:list />
		</div>
		<div class="menu-buttons">
			<button
				class="list-button"
				onclick={() => {
					showResultList = true;
					showListbuilder = false;
					showEraFaction = !showEraFaction;
					showFilters = false;
				}}
			>
				Era/Faction <br />
				<span class="secondary-text">
					{#if resultList.eras.length == 0}Any Era{:else if resultList.eras.length == 1}{eraLookup.get(resultList.eras[0])?.slice(0, 20)}{:else}{resultList.eras.length} Eras{/if} -
					{#if resultList.factions.length == 0}Any Faction{:else if resultList.factions.length == 1}{factionLookup.get(resultList.factions[0])?.slice(0, 22)}{:else}{resultList
							.factions.length} Factions{/if}
				</span>
			</button>
			<button
				class="list-button"
				onclick={() => {
					showResultList = true;
					showListbuilder = false;
					showEraFaction = false;
					showFilters = !showFilters;
				}}
				>Filters <br /> <span class="secondary-text">{resultList.filteredList.length}/{resultList.restrictedList.length}</span>
			</button>
			<button
				class="list-button"
				onclick={() => {
					showResultList = !showResultList;
					showListbuilder = !showListbuilder;
					showEraFaction = false;
					showFilters = false;
				}}
			>
				List <br />
				<span class="secondary-text">{list.unitCount} Units - {list.pv}pv</span>
			</button>
		</div>
	{/if}
</main>

<style>
	main {
		margin: 0;
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	@media (min-width: 1000px) {
		main {
			display: grid;
			grid-template-columns: 7fr 3fr;
			gap: 8px;
		}
	}
	.search {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		flex: 1;
	}
	.result-list-wrapper {
		display: flex;
		flex: 1;
	}
	.list-drawer-wrapper {
		flex: 1;
	}
	.menu-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		background-color: var(--surface-color);
	}
	.list-button {
		min-height: 30px;
		border-radius: 0;
		background-color: transparent;
		color: var(--text-color);
		padding: 8px 4px;
		border-right: 1px solid var(--border);
	}
	.list-button-opened {
		background-color: var(--surface-color-light);
	}
	.secondary-text {
		font-size: 0.9em;
	}
</style>
