<script lang="ts">
	import { PersistedState, watch } from "runed";
	import ListTab from "./components/ListTab.svelte";
	import { onMount, setContext } from "svelte";
	import { type ListCode, List } from "$lib/types/list.svelte";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { Tabs, ContextMenu } from "bits-ui";
	import { getListCodeFromString, loadExistingListsFromLocalStorage } from "$lib/utilities/listImport";

	let settings = new PersistedState<Settings>("listbuilderSettings", {
		print: { printingStyle: "detailed", printFormations: true, printCardsByFormation: false, printFormationBonuses: true, cardStyle: "generated", formationHeaderStyle: "inline" },
		sublistUI: {
			sublistOrientation: "vertical",
			sublistSortOrder: "pv",
			sublistPrintListSettings: {
				printingStyle: "detailed",
				printFormations: true,
				printCardsByFormation: false,
				printFormationBonuses: true,
				cardStyle: "generated",
				formationHeaderStyle: "inline"
			},
			sublistPrintAllOrientation: "vertical",
			sublistPrintAllGroupByScenario: false
		}
	});
	setContext("listbuilderSettings", settings.current);

	let lastLists = new PersistedState<string[]>("last-lists", []);

	let activeLists = $state<List[]>([]);
	let selectedList = $state<string>("");

	let listCodes = $derived(activeLists.map((list) => list.getListCode()));

	watch(
		() => listCodes,
		() => {
			if (listCodes.length != 0) {
				lastLists.current = listCodes;
			}
		}
	);

	let { data } = $props();

	onMount(() => {
		activeLists = loadExistingListsFromLocalStorage();
		if (data.sharedList) {
			let list = new List(new ResultList());
			let listCode: ListCode = {
				id: data.sharedList.id,
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
		}
		if (activeLists.length == 0) {
			activeLists.push(new List(new ResultList()));
		}
		selectedList = (activeLists.length - 1).toString();
	});

	function handleAddListButton() {
		activeLists.push(new List(new ResultList()));
		selectedList = (activeLists.length - 1).toString();
	}
	function listCloseCallback(id: string) {
		const list = activeLists.find((list) => list.id == id);
		if (!list?.units.length || confirm("Are you sure you wish to close this list? Any unsaved changes will be lost.")) {
			activeLists = activeLists.filter((list) => list.id != id);
			selectedList = (activeLists.length - 1).toString();
		}
	}
	function duplicateList(list: List) {
		const newList = new List(new ResultList());
		const copiedData = JSON.parse(list.getListCode());

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

	watch(
		() => activeLists,
		() => {
			if (activeLists.length == 0) {
				activeLists.push(new List(new ResultList()));
				selectedList = (activeLists.length - 1).toString();
			}
		}
	);
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
		<button class="listbuilder-tabs-add-button" onclick={handleAddListButton}>+</button>
	</Tabs.List>
	{#each activeLists as list, index}
		<Tabs.Content value={index.toString()} class="listbuilder-tabs-content">
			<ListTab {list} resultList={list.resultList!} {listCloseCallback}></ListTab>
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
		padding: 0 2px;
		display: grid;
		grid-template-rows: max-content;
		grid-auto-columns: max-content;
		grid-auto-flow: column;
		gap: 4px;
		border-bottom: 1px solid var(--border);
		overflow-x: auto;
		margin-bottom: 2px;
	}
	:global(.listbuilder-tabs-trigger) {
		padding: 8px 24px;
		background-color: var(--card);
		color: var(--card-foreground);
		border-radius: var(--radius) var(--radius) 0 0;
		border: 1px solid var(--border);
		display: flex;
	}
	:global(.listbuilder-tabs-add-button) {
		padding: 8px 24px;
		background-color: var(--card);
		color: var(--card-foreground);
		border-radius: var(--radius) var(--radius) 0 0;
		border: 1px solid var(--border);
	}
	:global(.listbuilder-tabs-trigger[data-state="active"]) {
		border: 1px solid var(--primary);
	}
	:global(.listbuilder-tabs-trigger:hover, .listbuilder-tabs-add-button:hover) {
		background-color: var(--muted);
	}
	:global(.listbuilder-tabs-content) {
		width: 100%;
		height: 100%;
	}
</style>
