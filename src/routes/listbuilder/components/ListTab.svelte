<script lang="ts">
	import { setContext } from "svelte";
	import { Listbuilder } from "./index";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { SearchFilters, SearchParameters, SearchResults } from "$lib/UnitSearch/index";
	import { slide } from "svelte/transition";
	import { List } from "$lib/types/";

	type Props = {
		list: List;
		resultList: ResultList;
		listCloseCallback: (id: string) => void;
	};

	let { list, resultList, listCloseCallback }: Props = $props();

	setContext("resultList", resultList);
	setContext("list", list);

	let showListbuilder = $state(false);
	let recentChanges: string[] = [
		"Multiple Era and faction selection!",
		`You can also now turn off the automatic "Official" general list to only see units that are in the era/faction combination you selected.`
	];
	let description: string[] = [
		"An Alpha Strike list builder I've created to help filter the data from the amazing work the Master Unit List team has done.",
		"Feedback will always be welcome. If you found your way here, you probably know me on facebook or through the wolfnet discord, so feel free to ping me. (Discord - Jonathan 'Terminal' Colton)"
	];
</script>

<main>
	<div class="search">
		<SearchParameters bind:list bind:resultList />
		<SearchFilters bind:resultList />
		{#if list.rules != "noRes"}
			<p class="rules-notice">Some units may be filtered out due to the selected ruleset</p>
		{/if}
		<SearchResults bind:list bind:resultList />
	</div>
	<div class="list-drawer-wrapper" class:show-listbuilder={showListbuilder} transition:slide>
		<Listbuilder {recentChanges} {description} {listCloseCallback} {list} />
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
	<div class:backdrop={showListbuilder}></div>
</main>

<style>
	main {
		margin: 0;
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
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
		gap: 8px;
		width: 100%;
		flex: 1;
	}
	button {
		height: min(30px, 90%);
	}
	.list-button {
		background-color: var(--secondary);
		color: var(--secondary-foreground);
		position: fixed;
		bottom: 34px;
		right: 5px;
		height: 30px;
		font-size: 1.25em;
		width: max-content;
	}
	.rules-notice {
		align-self: center;
	}
</style>
