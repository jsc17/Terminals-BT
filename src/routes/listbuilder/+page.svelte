<script lang="ts">
	import { SearchParameters, SearchResults, SearchFilters, Listbuilder } from "$lib/components/index";
	import { resultList } from "$lib/utilities/resultList.svelte";
	import { appWindow } from "$lib/utilities/responsive.svelte";
	import { list } from "./list.svelte";
	import { setContext, onMount } from "svelte";
	import { filters } from "./filters";

	let status = $state<"waiting" | "loading" | "loaded" | "error">("waiting");
	let listDialog: HTMLDialogElement;
	let showListDialog = $state(false);
	let recentChanges: string[] = ["Added Export for Jeff's Battletech Tools"];
	let description: string[] = [
		"An Alpha Strike list builder I've created to help filter the data from the amazing work the Master Unit List team has done.",
		"Feedback will always be welcome. If you found your way here, you probably know me on facebook or through the wolfnet discord, so feel free to ping me. (Discord - Jonathan 'Terminal' Colton)"
	];

	setContext("list", list);

	onMount(() => {
		resultList.clear();
		resultList.customCards = undefined;
		resultList.restrictions = undefined;
		resultList.filters = filters;
	});

	$effect(() => {
		if (listDialog != undefined) {
			if (showListDialog) {
				listDialog.showModal();
			} else {
				try {
					listDialog.close();
				} catch {
					console.log(listDialog);
				}
			}
		}
	});
</script>

<main class:main-wide={!appWindow.isNarrow}>
	<div class="search">
		<SearchParameters bind:status />
		<SearchFilters />
		<SearchResults bind:status />
	</div>
	{#if !appWindow.isNarrow}
		<Listbuilder bind:status {recentChanges} {description} />
	{:else}
		<button
			on:click={() => {
				showListDialog = !showListDialog;
			}}
			class="list-button">List - {list.units.length} Units - {list.pv} PV</button>
	{/if}
</main>

{#if appWindow.isNarrow}
	<dialog
		bind:this={listDialog}
		class:dialog-wide={appWindow.isNarrow}
		on:close={() => {
			showListDialog = false;
		}}>
		<div class="dialog-button">
			<button
				on:click={() => {
					showListDialog = false;
				}}>Close</button>
		</div>
		<Listbuilder bind:status {recentChanges} {description}></Listbuilder>
	</dialog>
{/if}

<style>
	main {
		margin: 0;
		position: relative;
		padding: 8px;
		flex: 1;
		width: 100%;
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
		align-items: center;
		gap: 8px;
		width: 100%;
		margin: 0;
	}
	footer {
		position: fixed;
		bottom: 0;
		width: 100%;
		height: 50px;
		display: flex;
		justify-content: flex-end;
		gap: 16px;
		padding: 4px;
		padding-right: 16px;
		overflow-x: hidden;
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
