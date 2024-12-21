<script lang="ts">
	import { UnitList } from "../../lib/types/list.svelte";
	import { onMount, setContext } from "svelte";
	import { Listbuilder } from "./components/index";
	import { getRules, ruleSets } from "$lib/types/options";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { SearchFilters, SearchParameters, SearchResults } from "$lib/components/index";
	import { slide } from "svelte/transition";

	const resultList = new ResultList();
	const list = new UnitList(resultList);
	setContext("resultList", resultList);
	setContext("list", list);

	let selectedRules = $state<string>("");
	let listDialog = $state<HTMLDialogElement>();
	let showListbuilder = $state(false);
	let recentChanges: string[] = [
		"Combined generic and wolfnet 350 list builders into one, for easier maintainance and eventually customization of rules.",
		"Choosing the correct ruleset from the dropdown above will limit the units offered in the results panel, but does not currently validate extra rules (such as 350's various rule of 2's)"
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
		if (lastList) {
			const importData = JSON.parse(lastList);
			const parsedCode = {
				name: importData.name ?? "Imported List",
				era: importData.era ?? 0,
				faction: importData.faction ?? 0,
				rules: getRules(importData.rules) ?? ruleSets[0],
				units: importData.units ?? [],
				sublists: importData.sublists ?? []
			};
			list.loadList(parsedCode);
		}
	});
	$effect(() => {
		list.items;
		localStorage.setItem("last-list", list.createListCode());
	});

	$effect(() => {
		if (listDialog != undefined) {
			if (showListbuilder) {
				listDialog.showModal();
			} else {
				try {
					listDialog.close();
				} catch (error) {}
			}
		}
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
</style>
