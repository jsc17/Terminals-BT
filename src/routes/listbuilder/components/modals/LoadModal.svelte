<script lang="ts">
	import { getContext } from "svelte";
	import { deserialize } from "$app/forms";
	import { toastController } from "$lib/stores/toastController.svelte";
	import { List, type ListCode } from "$lib/types/list.svelte";
	import { getListCodeFromString } from "$lib/utilities/listImport";
	import { Dialog } from "$lib/generic";
	import { getRulesByName } from "$lib/types/rulesets";
	import { getUsersLists, loadUserList } from "$lib/remote/list.remote";

	let user: any = getContext("user");
	type Props = {
		list: List;
	};

	let { list = $bindable() }: Props = $props();

	let importCode = $state("");
	let usersLists = $state<{ name: string; rules?: string; id: string; local: boolean }[]>([]);
	let selectedList = $state<string>();
	let localListsExist = $state(false);

	export function show() {
		open = true;
		importCode = "";
		selectedList = undefined;
		usersLists = getLocalLists();
		getUsersLists().then((lists) => {
			if (lists.status == "success") {
				usersLists = usersLists.concat(lists.data!.map((list) => ({ ...list, rules: list.rules ?? undefined, local: false })));
				usersLists = usersLists.sort((a, b) => a.name.localeCompare(b.name));
			} else {
				toastController.addToast("Failed to load lists from server, please try again");
			}
		});
	}

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

	async function deleteList(idToRemove: string) {
		// let listToRemove = usersLists.find((list) => {
		// 	return list.id == idToRemove;
		// })!;
		// if (localLists.includes(listToRemove.name)) {
		// 	localStorage.removeItem(listToRemove.name);
		// 	localLists = localLists.filter((listName) => {
		// 		return listName != listToRemove.name;
		// 	});
		// 	localStorage.setItem("lists", JSON.stringify(localLists));
		// 	usersLists = usersLists.filter((list) => {
		// 		return list.id != idToRemove;
		// 	});
		// } else {
		// 	const response: any = deserialize(await (await fetch("?/deleteList", { method: "POST", body: JSON.stringify({ id: idToRemove }) })).text());
		// 	if (response.status == 200) {
		// 		usersLists = usersLists.filter((list) => {
		// 			return list.id != idToRemove;
		// 		});
		// 	} else {
		// 		alert("List deletion failed. Please try again");
		// 	}
		// }
	}

	async function importList() {
		const listCode = getListCodeFromString(importCode);
		if (listCode) {
			list.loadList(listCode);
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
		if (listData.local) {
			const listCode = getListCodeFromString(localStorage.getItem(listData.name)!);
			if (listCode) list.loadList(listCode);
		} else {
			const listCode = await loadUserList(listData.id);
			if (listCode) list.loadList(listCode);
		}
		open = false;
	}
	let open = $state(false);
</script>

<Dialog title="Load List" bind:open>
	{#snippet description()}
		{#if !user.username}
			<p class="muted">Login to load lists saved to account</p>
		{/if}
	{/snippet}

	<div class="load-modal-body">
		<div class="list-container">
			<div class="list-item-header">
				<div class="list-item-name center">List Name</div>
				<div class="center">Rules</div>
			</div>
			{#each usersLists as savedList}
				<input type="radio" class="load-dialog-list-radio" name="selectedList" id={"LoadDialogList" + savedList.id} value={savedList.id} bind:group={selectedList} />
				<label for={"LoadDialogList" + savedList.id} class="load-dialog-list-label" ondblclick={() => loadList()}>
					<span class="list-item-name">{savedList.name}</span>
					<span class="center">{getRulesByName(savedList.rules ?? "noRes")?.shortDisplay ?? "-"}</span>
				</label>
			{/each}
		</div>
		<button
			class="load-button"
			onclick={() => {
				loadList();
			}}>Load</button
		>
		{#if localListsExist}
			<p>Lists with red names are saved to local device storage . Please consider creating an account to sync them between devices.</p>
		{/if}
		<br />
		<p>Paste a list code into the box below to import a saved code:</p>
		<div class="load-bar">
			<label for="importCode">List Code: </label><input type="text" name="importCode" id="importCode" bind:value={importCode} />
			<button onclick={importList}> Import </button>
		</div>
	</div>
</Dialog>

<style>
	.load-modal-body {
		display: flex;
		flex-direction: column;
		gap: 8px;
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

	.selected {
		box-shadow: 5px 0px 5px var(--primary) inset;
	}
	.local {
		color: var(--error);
	}
	.load-button {
		width: fit-content;
	}

	.list-container {
		min-width: 100%;
		min-height: 200px;
		max-height: 30em;
		overflow-y: auto;
		background-color: var(--surface-color);
		display: grid;
		grid-template-columns: 1fr 25%;
	}
	.list-item,
	.list-item-header {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 2;
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
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		width: 100%;
	}
	.list-item:hover {
		background-color: var(--surface-color-extra-light);
	}
	.load-dialog-list-radio {
		display: none;
	}
	.load-dialog-list-label {
		padding-left: 4px;
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 2;
	}
	.load-dialog-list-label:nth-of-type(even) {
		background-color: var(--surface-color-light);
	}
	.load-dialog-list-label:hover {
		background-color: var(--surface-color-extra-light);
	}
	.load-dialog-list-radio:checked + .load-dialog-list-label {
		background-color: var(--primary);
		color: var(--primary-text);
	}
</style>
