<script lang="ts">
	import { ResultList } from "$lib/types/resultList.svelte";
	import { SearchFilters, SearchParameters, SearchResults } from "$lib/unitsearch";
	import { onMount } from "svelte";
	import { innerWidth } from "svelte/reactivity/window";
	import { eraLookup, factionLookup } from "$lib/data/erasFactionLookup";

	let resultList = $state(new ResultList());

	onMount(() => {
		resultList.loadResults([], [], -1);
	});

	let showEraFaction = $state(false);
	let showFilters = $state(false);
</script>

<main>
	{#if innerWidth.current && innerWidth.current >= 1000}
		<SearchParameters bind:resultList></SearchParameters>
		<SearchFilters bind:resultList></SearchFilters>
		<SearchResults bind:resultList></SearchResults>
	{:else}
		<div class="result-list-wrapper"><SearchResults bind:resultList /></div>
		<div class={{ hidden: !showEraFaction, "list-button-opened": showEraFaction }}><SearchParameters bind:resultList /></div>
		<div class={{ hidden: !showFilters, "list-button-opened": showFilters }}><SearchFilters bind:resultList /></div>
		<div class="menu-buttons">
			<button
				class="list-button"
				onclick={() => {
					showEraFaction = !showEraFaction;
					showFilters = false;
				}}
			>
				Era/Faction <br />
				<span class="secondary-text">
					{#if resultList.eras.length == 0}Any Era{:else if resultList.eras.length == 1}{eraLookup.get(resultList.eras[0])?.slice(0, 20)}{:else}{resultList.eras.length} Eras{/if}
					-
					{#if resultList.factions.length == 0}Any Faction{:else if resultList.factions.length == 1}{factionLookup.get(resultList.factions[0])?.slice(0, 22)}{:else}{resultList
							.factions.length} Factions{/if}
				</span>
			</button>
			<button
				class="list-button"
				onclick={() => {
					showEraFaction = false;
					showFilters = !showFilters;
				}}
				>Filters <br /> <span class="secondary-text">{resultList.filteredList.length}/{resultList.restrictedList.length}</span>
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
		flex: 1;
		overflow: hidden;
		gap: 8px;
	}
	.result-list-wrapper {
		display: flex;
		flex: 1;
	}
	.menu-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
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
