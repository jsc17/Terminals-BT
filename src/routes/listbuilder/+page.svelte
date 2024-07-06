<script lang="ts">
	import { resultList } from "./resultList.svelte";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { list } from "./list.svelte";
	import { onMount } from "svelte";
	import { Listbuilder, SearchParameters, SearchResults, SearchFilters } from "./components/index";
	import { getRules, ruleSets } from "$lib/types/options";

	let selectedRules = $state<string>("");
	let listDialog: HTMLDialogElement;
	let showListDialog = $state(false);
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
			console.log("loaded previous list");
		} else {
			console.log("no previous list");
		}
	});
	$effect(() => {
		list.items;
		localStorage.setItem("last-list", list.createListCode());
	});

	$effect(() => {
		if (listDialog != undefined) {
			if (showListDialog) {
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

<main class:main-wide={!appWindow.isNarrow}>
	<div class="search">
		<SearchParameters />
		<SearchFilters />
		<SearchResults />
	</div>
	{#if !appWindow.isNarrow}
		<Listbuilder {recentChanges} {description} />
	{:else}
		<dialog
			bind:this={listDialog}
			class:dialog-wide={appWindow.isNarrow}
			onclose={() => {
				showListDialog = false;
			}}
		>
			<div class="dialog-button">
				<button
					onclick={() => {
						showListDialog = false;
					}}>Close</button
				>
			</div>
			<Listbuilder {recentChanges} {description}></Listbuilder>
		</dialog>
		<button
			onclick={() => {
				showListDialog = !showListDialog;
			}}
			class="list-button">List - {list.unitCount} Units - {list.pv} PV</button
		>
	{/if}
</main>

<style>
	main {
		margin: 0;
		position: relative;
		padding: 8px;
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.main-wide {
		display: grid;
		grid-template-columns: 7fr 3fr;
		gap: 8px;
	}
	.search {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		height: 100%;
		margin: 0;
		flex: 1;
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
	.dialog-button {
		display: flex;
		justify-content: end;
		height: 25px;
	}
	.dialog-button > button {
		background-color: var(--secondary);
		color: var(--secondary-foreground);
	}
</style>
