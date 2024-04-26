<script lang="ts">
	import { SearchParameters, SearchResults, SearchFilters, Listbuilder } from "$lib/components/index";
	import { resultList } from "$lib/utilities/resultList.svelte";
	import { appWindow } from "$lib/utilities/responsive.svelte";
	import { list } from "./list.svelte";
	import { setContext, onMount } from "svelte";
	import { filters, restrictions } from "./filters";
	import customCards from "./customCards350.json";

	let status = $state<"waiting" | "loading" | "loaded" | "error">("waiting");
	let listDialog: HTMLDialogElement;
	let showListDialog = $state(false);
	let recentChanges: string[] = ["Added authentication to sync lists between devices", "Added Export for Jeff's Battletech Tools", "Add Sublist creator"];
	let description: string[] = [
		"A Wolfnet 350 listbuilder I've created to help filter the data from the amazing work the Master Unit List team has done.",
		"Designed with the restrictions and filters I feel most relevent for creating a 350 list. Feedback will always be welcome. I'm usually checking the wolfnet discord so feel free to ping me. (Jonathan 'Terminal' Colton)"
	];

	setContext("list", list);

	onMount(() => {
		resultList.clear();
		resultList.customCards = customCards;
		resultList.restrictions = restrictions;
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
			class="list-button">List - {list.units.length} Units - {list.valid.pv[1]} PV</button>
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
