<script lang="ts">
	import { resultList } from "./resultList.svelte";
	import { appWindow } from "$lib/utilities/responsive.svelte";
	import { list } from "./list.svelte";
	import { setContext, onMount } from "svelte";
	import { Listbuilder, SearchParameters, SearchResults, SearchFilters } from "./components/index";
	import { ruleSets } from "./options";

	let status = $state<"waiting" | "loading" | "loaded" | "error">("waiting");
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

	setContext("list", list);

	onMount(() => {
		resultList.clear();
		if (data.rules && ruleSets.find((value) => value.name == data.rules)) {
			selectedRules = data.rules;
		} else {
			selectedRules = "noRes";
		}
		resultList.setOptions(selectedRules);
		list.setOptions(selectedRules);
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

<main class:main-wide={!appWindow.isNarrow}>
	<div class="search">
		<SearchParameters bind:status />
		<SearchFilters />
		<SearchResults bind:status />
	</div>
	{#if !appWindow.isNarrow}
		<Listbuilder bind:status bind:selectedRules {recentChanges} {description} />
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
		<Listbuilder bind:status bind:selectedRules {recentChanges} {description}></Listbuilder>
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
