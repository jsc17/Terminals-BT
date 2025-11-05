<script lang="ts">
	import { onMount, setContext } from "svelte";
	import { Listbuilder } from "./index";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { SearchFilters, SearchParameters, SearchResults } from "$lib/unitsearch";
	import { slide } from "svelte/transition";
	import { List } from "$lib/types/list.svelte";
	import { watch } from "runed";

	type Props = {
		list: List;
		listCloseCallback: (id: string) => void;
	};

	let { list, listCloseCallback }: Props = $props();

	let resultList = $state<ResultList>(new ResultList());
	setContext("list", list);

	let showListbuilder = $state(false);

	watch([() => list.details.eras, () => list.details.factions, () => list.details.general], () => {
		resultList.loadResults(list.details.eras, list.details.factions, list.details.general);
	});

	onMount(() => {
		resultList.setOptions(list.rules);
	});
</script>

<main>
	<div class="search">
		<SearchParameters bind:list bind:resultList />
		<SearchFilters bind:resultList />
		<SearchResults bind:list bind:resultList />
	</div>
	<div class="list-drawer-wrapper" class:show-listbuilder={showListbuilder} transition:slide>
		<Listbuilder {listCloseCallback} bind:resultList bind:list />
	</div>
	<button
		onclick={() => {
			showListbuilder = !showListbuilder;
		}}
		class="list-button"
	>
		{#if showListbuilder}
			Close
		{:else}
			List - {list.unitCount} Units - {list.pv} PV
		{/if}
	</button>
	<div class={{ backdrop: showListbuilder, hidden: !showListbuilder }}></div>
</main>

<style>
	main {
		margin: 0;
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 6px;
		padding-top: 2px;
	}
	.list-drawer-wrapper {
		height: 100%;
		width: 100%;
	}
	@media (width < 1000px) {
		.list-drawer-wrapper {
			visibility: hidden;
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			margin-left: auto;
			margin-right: auto;
			z-index: 4;
			height: calc(100% - 30px);
			padding: 4px;
		}
		.show-listbuilder {
			visibility: visible;
		}
		.list-button {
			z-index: 5;
		}
		.backdrop {
			height: 100%;
			width: 100dvw;
			background-color: black;
			opacity: 0.9;
			z-index: 3;
			position: absolute;
			top: 0;
			right: 0;
		}
	}
	@media (min-width: 1000px) {
		main {
			display: grid;
			grid-template-columns: 7fr 3fr;
			gap: 8px;
		}
		.list-button {
			display: none;
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
	button {
		height: min(30px, 90%);
	}
	.list-button {
		position: fixed;
		bottom: 34px;
		right: 5px;
		height: 30px;
		font-size: 1.25em;
		width: max-content;
	}
</style>
