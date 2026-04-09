<script lang="ts">
	import { Dialog } from "$lib/generic/";
	import { toastController } from "$lib/stores";
	import { List, type ListCode } from "$lib/types/list.svelte";
	import { ruleSets, getRulesByName } from "$lib/rules/rulesets";
	import { Tabs } from "bits-ui";
	import { getListCodeFromString } from "$lib/utilities/listImport";
	import { deleteUsersLists, getUsersLists, loadUserList } from "$lib/remote/list.remote";
	import { getContext } from "svelte";

	type Props = { activeLists: List[]; activeListTab: string };
	let { activeLists, activeListTab = $bindable() }: Props = $props();
	let user: any = getContext("user");

	let listName = $state("");
	let rules = $state("noRes");
	let open = $state(false);
	let selectedTab = $state("new");

	export function openDialog(tab: "new" | "load") {
		listName = "";
		rules = "noRes";
		open = true;
		selectedTab = tab;
		importCode = "";
		selectedList = undefined;
		usersLists = getLocalLists();
		if (user.username) {
			getUsersLists().then((lists) => {
				if (lists.status == "success") {
					usersLists = usersLists.concat(lists.data!.map((list) => ({ ...list, rules: list.rules ?? undefined, local: false })));
					usersLists = usersLists.sort((a, b) => a.name.localeCompare(b.name));
				} else {
					toastController.addToast("Failed to load lists from server, please try again");
				}
			});
		}
	}

	function createList() {
		if (listName.length <= 0) {
			toastController.addToast("List name cannot be empty");
			return;
		}
		const newList = new List();
		newList.details.name = listName;
		newList.rules = rules;
		activeLists.push(newList);
		activeListTab = (activeLists.length - 1).toString();
		open = false;
	}
	let importCode = $state("");
	let usersLists = $state<{ name: string; rules?: string; id: string; local: boolean }[]>([]);
	let selectedList = $state<string>();
	let localListsExist = $state(false);
	let managingLists = $state(false);
	let listsToDelete = $state<string[]>([]);

	function getLocalLists() {
		// load local storage saved sublists
		let localLists: { name: string; rules?: string; id: string; local: boolean }[] = [];
		let localListNames = JSON.parse(localStorage.getItem("lists") ?? "[]");
		if (localListNames.length) {
			localListsExist = true;
			for (const localListName of localListNames) {
				const localData = localStorage.getItem(localListName)!;
				const listCode = getListCodeFromString(localData);
				if (listCode) localLists.push({ ...listCode, local: true });
			}
		}
		return localLists;
	}

	async function deleteSelectedLists() {
		if (confirm(`Are you sure you want to delete ${listsToDelete.length} lists?`)) {
			const serverListsToDelete = usersLists.filter((list) => !list.local && listsToDelete.includes(list.id));
			const localListsToDelete = usersLists.filter((list) => list.local && listsToDelete.includes(list.id));
			deleteUsersLists(serverListsToDelete.map((list) => list.id));
			localListsToDelete.forEach((list) => {
				localStorage.removeItem(list.name);
			});

			localStorage.setItem("lists", JSON.stringify(usersLists.filter((list) => list.local).map((list) => list.name)));
			usersLists = usersLists.filter((list) => !listsToDelete.includes(list.id));
			managingLists = false;
		}
	}

	async function importList() {
		const listCode = getListCodeFromString(importCode);
		const newList = new List();

		if (listCode) {
			newList.loadList(listCode);
			activeLists.push(newList);
			activeListTab = (activeLists.length - 1).toString();

			toastController.addToast("List imported");
			open = false;
		} else {
			toastController.addToast("Invalid list code. Import failed.");
		}
	}

	async function loadList() {
		const listData = usersLists.find((list) => {
			return list.id == selectedList;
		})!;
		const newList = new List();
		if (listData.local) {
			const listCode = getListCodeFromString(localStorage.getItem(listData.name)!);
			if (listCode) newList.loadList(listCode);
		} else {
			const listCode = await loadUserList(listData.id);
			if (listCode) newList.loadList(listCode);
		}
		activeLists.push(newList);
		activeListTab = (activeLists.length - 1).toString();
		open = false;
	}
</script>

<Dialog title="New List" bind:open>
	<Tabs.Root bind:value={selectedTab} orientation="horizontal" class="new-list-dialog-tabs">
		<Tabs.List class="matchUnitTabs">
			<Tabs.Trigger class="matchUnitTrigger" value="new">New List</Tabs.Trigger>
			<Tabs.Trigger class="matchUnitTrigger" value="load">Load List</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="new">
			<div class="new-list-dialog-body">
				<p>Select a name and rules for the new list</p>

				<label>Name: <input type="text" bind:value={listName} placeholder="List Name" /></label>
				<label
					>Rules: <select bind:value={rules} placeholder="Rules">
						{#each ruleSets as ruleset}
							<option value={ruleset.name}>{ruleset.display}</option>
						{/each}
					</select>
				</label>
				<div class="new-list-dialog-footer">
					<button onclick={() => (open = false)}>Cancel</button>
					<button onclick={createList}>Create</button>
				</div>
			</div>
		</Tabs.Content>
		<Tabs.Content value="load">
			{#if !user.username}
				<p class="muted">Login to load lists saved to account</p>
			{/if}
			{#if localListsExist}
				<p class="muted">Lists with red names are saved to local device storage . Please consider creating an account to sync them between devices.</p>
			{/if}
			<div class="load-modal-body">
				<div class="list-container">
					<div class="list-item-header">
						<div></div>
						<div class="list-item-name center">List Name</div>
						<div class="center">Rules</div>
					</div>
					{#if !managingLists}
						{#each usersLists as savedList}
							<div class={{ "list-item-row": true, selected: savedList.id == selectedList }}>
								<input type="radio" class="load-dialog-list-radio" name="selectedList" id={"LoadDialogList" + savedList.id} value={savedList.id} bind:group={selectedList} />
								<label for={"LoadDialogList" + savedList.id} class={{ "load-dialog-list-label": true }} ondblclick={() => loadList()}>
									<span class={{ "list-item-name": true, local: savedList.local }}>{savedList.name}</span>
									<span class="center">{getRulesByName(savedList.rules ?? "noRes")?.shortDisplay ?? "-"}</span>
								</label>
							</div>
						{/each}
					{:else}
						{#each usersLists as savedList}
							<div class="list-item-row">
								<input type="checkbox" name="selectedList" id={"LoadDialogList" + savedList.id} value={savedList.id} bind:group={listsToDelete} />
								<label for={"LoadDialogList" + savedList.id} class={{ "load-dialog-list-label": true, local: savedList.local }} ondblclick={() => loadList()}>
									<span class="list-item-name">{savedList.name}</span>
									<span class="center">{getRulesByName(savedList.rules ?? "noRes")?.shortDisplay ?? "-"}</span>
								</label>
							</div>
						{/each}
					{/if}
				</div>
				<div class="space-between">
					{#if !managingLists}
						<button onclick={() => (managingLists = true)}>Manage Lists</button>
						<button
							class="load-button"
							onclick={() => {
								loadList();
							}}>Load</button
						>
					{:else}
						<div>
							<button onclick={() => (managingLists = false)}>Cancel</button>
							<button onclick={deleteSelectedLists}>Delete</button>
						</div>
					{/if}
				</div>
				<br />
				<p>Paste a list code into the box below to import a saved code:</p>
				<div class="load-bar">
					<label for="importCode">List Code: </label><input type="text" name="importCode" id="importCode" bind:value={importCode} />
					<button onclick={importList}> Import </button>
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</Dialog>

<style>
	.new-list-dialog-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.new-list-dialog-footer {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
	}
	.load-modal-body {
		display: grid;
		grid-auto-rows: max-content;
		gap: 8px;
		overflow-y: auto;
	}
	input[type="text"] {
		width: 75%;
	}
	.load-bar {
		display: flex;
		gap: 8px;
		justify-content: center;
		align-items: center;
	}
	.local {
		color: var(--error);
	}
	.load-button {
		width: fit-content;
	}

	.list-container {
		min-width: 100%;
		overflow-y: auto;
		background-color: var(--surface-color);
		display: grid;
		grid-template-columns: max-content 1fr max-content;
		grid-auto-rows: max-content;
		max-height: 50dvh;
	}
	.list-item-header {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 3;
		background-color: var(--surface-color);
		padding: 2px 8px;
		border-radius: 0;
		border-bottom: 1px solid var(--border);
	}
	.list-item-header {
		background-color: var(--surface-color-dark);
		border-bottom: 3px solid var(--border);
	}
	.list-item-name {
		text-align: start;
		width: 100%;
	}
	.list-item-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 3;
		padding: 2px;
	}
	.list-item-row:nth-of-type(even) {
		background-color: var(--surface-color-light);
	}
	.load-dialog-list-radio {
		visibility: hidden;
		height: 0;
		width: 0;
	}
	.load-dialog-list-label {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 2;
	}
	.load-dialog-list-label:hover {
		background-color: var(--surface-color-extra-light);
	}
	input[type="checkbox"],
	input[type="radio"] {
		margin: 0;
		margin-right: 8px;
	}
	.selected {
		box-shadow: inset 0 0 0 1px var(--primary);
	}
</style>
