<script lang="ts">
	import { onMount, setContext } from "svelte";
	import { Listbuilder } from "./components/index";
	import { ruleSets } from "$lib/types/options";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { SearchFilters, SearchParameters, SearchResults } from "$lib/components/index";
	import { slide } from "svelte/transition";
	import { List } from "./types/list.svelte";
	import { convertUnversionedJSONList } from "./utilities/convert";
	import type { ListCode } from "./types/listCode";

	const resultList = new ResultList();
	const list = new List(resultList);
	setContext("resultList", resultList);
	setContext("list", list);

	let selectedRules = $state<string>("");
	let showListbuilder = $state(false);
	let recentChanges: string[] = [
		"Multiple Era and faction selection!",
		`You can also now turn off the automatic "Official" general list to only see units that are in the era/faction combination you selected.`
	];
	let description: string[] = [
		"An Alpha Strike list builder I've created to help filter the data from the amazing work the Master Unit List team has done.",
		"Feedback will always be welcome. If you found your way here, you probably know me on facebook or through the wolfnet discord, so feel free to ping me. (Discord - Jonathan 'Terminal' Colton)"
	];
	let { data } = $props();

	onMount(() => {
		if (data.rules && ruleSets.find((value) => value.name == data.rules)) {
			list.setOptions(data.rules);
			resultList.setOptions(selectedRules);
		}
		const lastList = localStorage.getItem("last-list");
		let importData;
		if (lastList) {
			importData = JSON.parse(lastList);
			if (importData.lcVersion) {
				console.log(importData);
				let eras, factions;
				if (importData.lcVersion == 2) {
					eras = importData.eras;
					factions = importData.factions;
				} else {
					eras = importData.era == 0 ? [] : [importData.era];
					factions = importData.faction == 0 ? [] : [importData.faction];
				}
				const parsedCode: ListCode = {
					id: importData.id ?? crypto.randomUUID(),
					name: importData.name ?? "Imported List",
					eras,
					factions,
					rules: importData.rules ?? "noRes",
					units: importData.units ?? [],
					sublists: importData.sublists ?? [],
					lcVersion: importData.lcVersion ?? 0,
					formations: importData.formations ?? []
				};
				list.loadList(parsedCode);
			} else {
				const updatedList = convertUnversionedJSONList(importData);
				list.loadList(updatedList);
			}
		}
	});

	$effect(() => {
		list.listCode;
		localStorage.setItem("last-list", list.getListCode());
	});
</script>

<svelte:head>
	<title>Terminal's Alpha Strike List Builder</title>
	<meta
		name="description"
		content="Create, edit, and print lists for Battletech's Alpha Strike ruleset using advanced filtering and search features. Includes support for generic Alpha Strike lists and Wolfnet's 350 ruleset. Based on data from the Master Unit List"
	/>
</svelte:head>

<main>
	<div class="search">
		<SearchParameters />
		<SearchFilters />
		{#if list.rules != "noRes"}
			<p class="rules-notice">Some units may be filtered out due to the selected ruleset</p>
		{/if}
		<SearchResults />
	</div>
	<div class="list-drawer-wrapper" class:show-listbuilder={showListbuilder} transition:slide>
		<Listbuilder {recentChanges} {description} />
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
		display: flex;
		flex-direction: column;
	}

	@media (width < 1000px) {
		.list-drawer-wrapper {
			visibility: hidden;
			position: absolute;
			bottom: 70px;
			left: 0;
			right: 0;
			margin-left: auto;
			margin-right: auto;
			z-index: 4;
			height: 100%;
			width: min(max-content, 95dvw);
		}
		.show-listbuilder {
			visibility: visible;
		}
		.list-button {
			z-index: 5;
		}
		.backdrop {
			height: 100dvh;
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
	.list-drawer-wrapper {
		height: 100%;
		width: 100%;
	}
	button {
		height: min(30px, 90%);
	}
	.list-button {
		background-color: var(--secondary);
		color: var(--secondary-foreground);
		position: fixed;
		bottom: 15px;
		right: 25px;
		height: 50px;
		font-size: 1.25rem;
	}
	.rules-notice {
		align-self: center;
	}
</style>
