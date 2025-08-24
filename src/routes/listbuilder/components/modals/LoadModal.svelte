<script lang="ts">
	import { getContext } from "svelte";
	import { deserialize } from "$app/forms";
	import { toastController } from "$lib/stores/toastController.svelte";
	import { List, type ListCode } from "$lib/types/list.svelte";
	import { getListCodeFromString } from "$lib/utilities/listImport";
	import { Dialog } from "$lib/generic";

	let user: any = getContext("user");
	type Props = {
		list: List;
	};

	let { list = $bindable() }: Props = $props();

	let importCode = $state("");
	let savedLists = $state<ListCode[]>([]);
	let selectedListIndex = $state(-1);
	let localListsExist = $state(false);
	let dialogElement: HTMLDialogElement;
	let localLists = $state<string[]>([]);

	export function show() {
		open = true;
		importCode = "";
		getLists();
	}

	async function getLists() {
		savedLists = [];
		localListsExist = false;
		//attempt to load saved lists from server
		if (user.username) {
			const response: any = deserialize(await (await fetch("?/loadList", { method: "POST", body: "" })).text());
			if (response.status == 200) {
				const responseLists = JSON.parse(response.data.lists);
				for (const tempList of responseLists) {
					savedLists.push({
						id: tempList.id,
						name: tempList.name,
						eras: JSON.parse(tempList.eras),
						factions: JSON.parse(tempList.factions),
						units: JSON.parse(tempList.units),
						formations: JSON.parse(tempList.formations),
						sublists: JSON.parse(tempList.sublists),
						rules: tempList.rules ?? "noRes",
						lcVersion: tempList.lcVersion,
						scas: tempList.scas ? JSON.parse(tempList.scas) : undefined,
						bs: tempList.bs ? JSON.parse(tempList.bs) : undefined
					});
				}
			} else {
				toastController.addToast("Failed to load lists from server, please try again");
			}
		}
		// load local storage saved sublists
		localLists = JSON.parse(localStorage.getItem("lists") ?? "[]");
		if (localLists.length) {
			localListsExist = true;
			for (const localListName of localLists) {
				const localData = localStorage.getItem(localListName)!;
				const listCode = getListCodeFromString(localData);
				if (listCode) savedLists.push(listCode);
			}
		}
	}

	async function deleteList(idToRemove: string) {
		let listToRemove = savedLists.find((list) => {
			return list.id == idToRemove;
		})!;
		if (localLists.includes(listToRemove.name)) {
			localStorage.removeItem(listToRemove.name);
			localLists = localLists.filter((listName) => {
				return listName != listToRemove.name;
			});
			localStorage.setItem("lists", JSON.stringify(localLists));
			savedLists = savedLists.filter((list) => {
				return list.id != idToRemove;
			});
		} else {
			const response: any = deserialize(await (await fetch("?/deleteList", { method: "POST", body: JSON.stringify({ id: idToRemove }) })).text());
			if (response.status == 200) {
				savedLists = savedLists.filter((list) => {
					return list.id != idToRemove;
				});
			} else {
				alert("List deletion failed. Please try again");
			}
		}
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
		await list.loadList(savedLists[selectedListIndex]);
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
		<div class="table-container">
			<table class="saved-lists">
				<colgroup>
					<col />
					<col style="width:20px" />
				</colgroup>
				<tbody>
					{#each savedLists as savedList, index}
						<tr
							id={index.toString()}
							class:selected={selectedListIndex == index}
							onclick={() => {
								selectedListIndex = index;
							}}
							ondblclick={() => {
								loadList();
							}}
						>
							<td class:local={localLists.includes(savedList.name)}>{savedList.name}</td>
							<td><button onclick={() => deleteList(savedList.id)}>-</button></td>
						</tr>
					{/each}
				</tbody>
			</table>
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
	.table-container {
		min-width: 100%;
		min-height: 200px;
		max-height: 30em;
		overflow-y: auto;
		background-color: var(--card);
	}
	table,
	tbody {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0 4px;
	}

	tbody tr:nth-child(even) {
		background-color: var(--muted);
	}
	.selected {
		box-shadow: 5px 0px 5px var(--primary) inset;
	}
	td {
		overflow: hidden;
		padding-left: 8px;
	}
	.local {
		color: var(--error);
	}
	.load-button {
		width: fit-content;
	}
</style>
