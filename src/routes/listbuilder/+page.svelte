<script lang="ts">
	import { PersistedState, watch } from "runed";
	import ListTab from "./components/ListTab.svelte";
	import { onMount, setContext } from "svelte";
	import { type ListCode, List } from "$lib/types/list.svelte";
	import { Tabs, ContextMenu } from "bits-ui";
	import { loadExistingListsFromLocalStorage } from "$lib/utilities/listImport";
	import { toastController } from "$lib/stores";
	import { db } from "$lib/offline/db";
	import { SettingsSchema, type SettingsOutput } from "./types/settings";
	import { parse } from "valibot";
	import { FilePlus } from "phosphor-svelte";

	let settings = new PersistedState<SettingsOutput>("listbuilderSettings", {
		print: {
			printStyle: "detailed",
			printFormations: true,
			printCardsByFormation: false,
			printFormationBonuses: true,
			cardStyle: "generated",
			formationHeaderStyle: "inline",
			measurementUnits: "inches",
			printReferences: true
		},
		sublistUI: {
			sublistOrientation: "vertical",
			sublistSortOrder: "pv",
			sublistPrintListSettings: {
				printStyle: "detailed",
				printFormations: true,
				printCardsByFormation: false,
				printFormationBonuses: true,
				cardStyle: "generated",
				formationHeaderStyle: "inline",
				measurementUnits: "inches",
				printReferences: true
			},
			sublistPrintAllOrientation: "vertical",
			sublistPrintAllGroupByScenario: false
		}
	});
	settings.current = parse(SettingsSchema, settings.current);
	settings.current = setContext("listbuilderSettings", settings.current);

	let activeLists = $state<List[]>([]);
	let selectedList = $state<string>("");

	let listCodes = $derived(activeLists.map((list) => list.getListCode()));

	watch(
		() => listCodes,
		() => {
			if (listCodes.length != 0) {
				// db.previousLists.clear();
				Promise.all(
					$state.snapshot(listCodes).map(async (lc) => {
						try {
							const id = await db.previousLists.put(lc);
						} catch (error) {
							console.log(`Failed to add previous list (${lc.id}) ${lc.name}: ${error}`);
						}
					})
				);
			}
		}
	);

	let { data } = $props();

	onMount(async () => {
		activeLists = await loadExistingListsFromLocalStorage();
		if (data.sharedList) {
			let list = new List();
			let listCode: ListCode = {
				id: crypto.randomUUID(),
				lcVersion: data.sharedList.lcVersion,
				name: data.sharedList.name,
				eras: JSON.parse(data.sharedList.eras),
				factions: JSON.parse(data.sharedList.factions),
				rules: data.sharedList.rules ?? "noRes",
				units: JSON.parse(data.sharedList.units),
				formations: JSON.parse(data.sharedList.formations),
				sublists: JSON.parse(data.sharedList.sublists),
				scas: data.sharedList.scas ? JSON.parse(data.sharedList.scas) : undefined
			};
			list.loadList(listCode);
			activeLists.push(list);
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.delete("share");
			window.history.replaceState({}, "", newUrl);
		}
		if (activeLists.length == 0) {
			activeLists.push(new List());
		}
		selectedList = (activeLists.length - 1).toString();
	});

	function handleAddListButton() {
		if (activeLists.length < 5) {
			activeLists.push(new List());
			selectedList = (activeLists.length - 1).toString();
		} else {
			toastController.addToast("For performance reasons, active lists tabs have been limited to 5. Please save and close a list to open a new one.");
		}
	}
	function listCloseCallback(id: string) {
		const list = activeLists.find((list) => list.id == id);
		if (list && (!list?.units.length || confirm("Are you sure you wish to close this list? Any unsaved changes will be lost."))) {
			activeLists = activeLists.filter((list) => list.id != id);
			db.previousLists.delete(list.id);
			selectedList = (activeLists.length - 1).toString();
		}
		if (activeLists.length == 0) {
			activeLists.push(new List());
			selectedList = (activeLists.length - 1).toString();
		}
	}
	function duplicateList(list: List) {
		const newList = new List();
		const copiedData = $state.snapshot(list.getListCode());

		const parsedCode: ListCode = {
			id: crypto.randomUUID(),
			name: copiedData.name,
			eras: copiedData.eras,
			factions: copiedData.factions,
			rules: copiedData.rules,
			units: copiedData.units,
			sublists: copiedData.sublists,
			lcVersion: copiedData.lcVersion,
			formations: copiedData.formations,
			scas: copiedData.scas,
			bs: copiedData.bs
		};

		newList.loadList(parsedCode);
		activeLists.push(newList);
	}
</script>

<svelte:head>
	<title>Terminal's Alpha Strike List Builder</title>
	<meta
		name="description"
		content="Create, edit, and print lists for Battletech's Alpha Strike ruleset using advanced filtering and search features. Includes support for generic Alpha Strike lists and Wolfnet's 350 ruleset. Based on data from the Master Unit List"
	/>
</svelte:head>

<Tabs.Root orientation="horizontal" class="listbuilder-tabs-root" bind:value={selectedList}>
	<Tabs.List class="listbuilder-tabs-list">
		{#each activeLists as list, index}
			<ContextMenu.Root>
				<ContextMenu.Trigger>
					<Tabs.Trigger value={index.toString()} class="listbuilder-tabs-trigger">
						{list.details.name}
					</Tabs.Trigger>
				</ContextMenu.Trigger>
				<ContextMenu.Portal>
					<ContextMenu.Content>
						<ContextMenu.Item class="context-button" onSelect={() => duplicateList(list)}>Duplicate List</ContextMenu.Item>
						<ContextMenu.Item class="context-button" onSelect={() => listCloseCallback(list.id)}>Close List</ContextMenu.Item>
					</ContextMenu.Content>
				</ContextMenu.Portal>
			</ContextMenu.Root>
		{/each}
		<button class="listbuilder-tabs-add-button" onclick={handleAddListButton}><FilePlus /></button>
	</Tabs.List>
	{#each activeLists as list, index}
		<Tabs.Content value={index.toString()} class="listbuilder-tabs-content">
			<ListTab {list} {listCloseCallback}></ListTab>
		</Tabs.Content>
	{/each}
</Tabs.Root>

<style>
	:global(.listbuilder-tabs-root) {
		margin: 0;
		position: relative;
		display: grid;
		grid-template-rows: max-content 1fr;
		width: 100%;
		height: 100%;
	}
	:global(.listbuilder-tabs-list) {
		padding: 2px 2px;
		display: grid;
		grid-template-rows: max-content;
		grid-auto-columns: max-content;
		grid-auto-flow: column;
		gap: 4px;
		overflow-x: auto;
	}
	:global(.listbuilder-tabs-trigger) {
		padding: 8px 24px;
		background-color: var(--surface-color);
		color: var(--text-color);
		border-radius: var(--radius);
		border: 1px solid var(--border);
		display: flex;
		box-shadow: 1px 3px 3px var(--surface-color-shadow);
	}
	:global(.listbuilder-tabs-add-button) {
		/* padding: 8px 24px; */
		background-color: var(--surface-color);
		color: var(--text-color);
		border-radius: var(--radius);
		border: 1px solid var(--border);
		box-shadow: 1px 3px 3px var(--surface-color-shadow);
	}
	:global(.listbuilder-tabs-trigger[data-state="active"]) {
		border: 1px solid var(--primary);
	}
	:global(.listbuilder-tabs-trigger:hover, .listbuilder-tabs-add-button:hover) {
		background-color: var(--surface-color-light);
	}
	:global(.listbuilder-tabs-content) {
		width: 100%;
		height: 100%;
	}
</style>
