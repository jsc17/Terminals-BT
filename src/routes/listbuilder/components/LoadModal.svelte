<script lang="ts">
	import { eras, factions } from "$lib/data/erasFactionLookup";
	import { appWindow } from "$lib/utilities/responsive.svelte";
	import { getContext } from "svelte";
	import { deserialize } from "$app/forms";
	import { resultList } from "../resultList.svelte";
	import { ruleSets, getRules, type Options } from "../options";

	let list: any = getContext("list");
	let user: any = getContext("user");

	let { showLoadModal = $bindable(), status = $bindable(), selectedRules = $bindable() } = $props();
	let loadDialog: HTMLDialogElement;
	let importCode = $state("");
	let savedLists = $state<{ name: string; era: number; faction: number; units: string; sublists: string; local: boolean; rules: Options }[]>([]);
	let selectedList = $state(-1);
	let localListsExist = $state(false);

	$effect(() => {
		if (showLoadModal == true) {
			getLists();
			loadDialog.showModal();
		} else {
			loadDialog.close();
		}
	});

	async function getLists() {
		savedLists = [];
		localListsExist = false;
		//attempt to load saved lists from server
		const response: any = deserialize(await (await fetch("/?/loadList", { method: "POST", body: "" })).text());
		if (response.status == 200) {
			const responseLists = JSON.parse(response.data.lists);
			for (const tempList of responseLists) {
				let rules = getRules(tempList.rules) ?? ruleSets[0];
				savedLists.push({
					name: tempList.name,
					era: Number(tempList.era),
					faction: Number(tempList.faction),
					units: tempList.units,
					sublists: tempList.sublists,
					local: false,
					rules
				});
			}
		} else {
			console.log(response.data.message);
		}

		//load local storage saved sublists
		const localLists = JSON.parse(localStorage.getItem("lists") ?? "[]");
		if (localLists.length) {
			localListsExist = true;
			for (const localListName of localLists) {
				const localData = localStorage.getItem(localListName)!;
				let [listDetails, localSublists] = localData.split("-");
				if (!localSublists) {
					localSublists = "";
				}
				let [localEra, localFaction, ...localUnits] = listDetails.split(":");
				const unitString = localUnits.join(":");
				savedLists.push({ name: localListName, era: Number(localEra), faction: Number(localFaction), units: unitString, sublists: localSublists, local: true, rules: ruleSets[0] });
			}
		}
	}

	async function deleteList(index: number) {
		let listToRemove = savedLists[index];
		if (listToRemove.local) {
			localStorage.removeItem(listToRemove.name);
			let localLists = JSON.parse(localStorage.getItem("lists")!);
			let localIndex = localLists.findIndex((element: string) => {
				return (element = listToRemove.name);
			});
			localLists.splice(localIndex, 1);
			localStorage.setItem("lists", JSON.stringify(localLists));
			savedLists.splice(index, 1);
		} else {
			const response: any = deserialize(await (await fetch("/?/deleteList", { method: "POST", body: JSON.stringify({ name: listToRemove.name }) })).text());
			if (response.status == 200) {
				savedLists.splice(index, 1);
			} else {
				alert("List deletion failed. Please try again");
			}
		}
	}

	async function loadList() {
		const { era, faction, name, units, sublists, rules } = savedLists[selectedList];

		list.setOptions(rules.name);
		resultList.setOptions(rules.name);
		selectedRules = rules.name;

		resultList.details.era = era;
		resultList.details.faction = faction;

		status = "loading";
		await resultList.loadUnits();

		status = "loaded";
		if (resultList.results.length == 0) {
			status = "error";
		}

		list.details.name = name;
		list.details.era = eras.get(era);
		list.details.faction = factions.get(faction);
		list.details.general = factions.get(resultList.general);
		if (sublists.length) {
			list.sublists = sublists.split(":");
		} else {
			list.sublists = [];
		}
		while (list.units.length) {
			list.remove(0);
		}

		let unitArray = units.split(":");

		unitArray.forEach((unit) => {
			let [id, skill] = unit.split(",");
			let unitToAdd = resultList.results.find((result: any) => {
				return result.id == parseInt(id);
			});
			if (unitToAdd != null) {
				list.add(unitToAdd);
			}
			if (skill != "undefined") {
				list.modifySkill(list.units.length - 1, parseInt(skill), list.units.at(-1)!.pv);
			}
		});

		showLoadModal = false;
	}

	function selectRow(index: number) {
		selectedList = index;
		importCode = `${savedLists[selectedList].era}:${savedLists[selectedList].faction}:${savedLists[selectedList].units}-${savedLists[selectedList].sublists}`;
	}
</script>

<dialog
	bind:this={loadDialog}
	on:close={() => {
		showLoadModal = false;
	}}
	class:dialog-wide={appWindow.isNarrow}>
	<div class="dialog-body">
		<div class="space-between">
			{#if user.username}
				<div></div>
			{:else}
				<p>Login to load lists saved to account</p>
			{/if}
			<button
				on:click={() => {
					showLoadModal = false;
				}}>Close</button>
		</div>
		<div class="table-container">
			<table class="saved-lists">
				<colgroup>
					<col />
					<col style="width:15%" />
					<col style="width:15%" />
					<col style="width:20%" />
					<col style="width:20px" />
				</colgroup>
				<thead>
					<tr>
						<th>List name</th>
						<th>Era</th>
						<th>Faction</th>
						<th>Rules</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each savedLists as savedList, index}
						<tr id={index.toString()} class:selected={selectedList == index} on:click={() => selectRow(index)} on:dblclick={loadList}>
							<td class:local={savedList.local}>{savedList.name}</td>
							<td style="text-align:center">{eras.get(savedList.era)}</td>
							<td style="text-align:center">{factions.get(savedList.faction)}</td>
							<td style="text-align:center">{savedList.rules.display}</td>
							<td><button on:click={() => deleteList(index)}>-</button></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if localListsExist}
			<p>Lists with red names are saved to local device storage . Load them and save to server to sync between devices.</p>
		{/if}
		<p>Select a list above or paste a list code into the box below.</p>
		<div class="load-bar">
			<label for="importCode">List Code: </label><input type="text" name="importCode" id="importCode" bind:value={importCode} />
			<button on:click={loadList}>Load</button>
			<button on:click={()=>{
					navigator.clipboard.writeText(importCode!);
				}}> Copy </button>
		</div>
	</div>
</dialog>

<style>
	dialog {
		width: 70%;
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
		height: 200px;
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
	th {
		border-bottom: 1px solid var(--border);
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
</style>
